'use client';

import { Button } from "@/components/ui/button";
import { useGoogleLogin } from '@react-oauth/google';
import { useState, useEffect } from "react";
import { Playlist, YouTubeAPIResponse, Video, YouTubeVideoResponse } from "@/types/youtube";
import { GoogleTokenResponse } from "@/types/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function Home() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse: GoogleTokenResponse) => {
      try {
        localStorage.setItem('access_token', tokenResponse.access_token);
        await fetchPlaylists(tokenResponse.access_token);
      } catch (err) {
        setError((err as Error).message);
      }
    },
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
  });

  const fetchPlaylists = async (accessToken: string): Promise<void> => {
    try {
      const response = await fetch(
        'https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching playlists: ${response.statusText}`);
      }

      const data: YouTubeAPIResponse = await response.json();
      setPlaylists(data.items || []);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const fetchVideos = async (playlistId: string): Promise<void> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error("Access token is missing.");
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching videos: ${response.statusText}`);
      }

      const data: YouTubeVideoResponse = await response.json();
      setVideos(data.items || []);
      setModalOpen(true);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handlePlaylistClick = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    fetchVideos(playlist.id);
  };

  const handleVideoClick = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchPlaylists(token);
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8 text-center">YouTube Playlist Data</h1>
      <p className="text-xl mb-6 text-center">
        Please Log In with Google to access the Playlist Data
      </p>
      <Button onClick={() => handleGoogleLogin()} className="flex items-center space-x-2 mb-8">
        <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        <span>Login with Google</span>
      </Button>

      {playlists.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <Card key={playlist.id} className="shadow-lg" onClick={() => handlePlaylistClick(playlist)}>
              <CardHeader>
                <CardTitle>{playlist.snippet.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={playlist.snippet.thumbnails.medium.url}
                  alt={`${playlist.snippet.title} thumbnail`}
                  className="rounded-md w-full mb-4"
                />
                <p><strong>Video Count:</strong> {playlist.contentDetails.itemCount}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogTitle>{selectedPlaylist?.snippet.title}</DialogTitle>
          <div className="grid grid-cols-1 gap-4">
            {videos.map((video) => (
              <Card
                key={video.id.videoId}
                onClick={() => handleVideoClick(video.id.videoId)}
                className="cursor-pointer"
              >
                <CardContent>
                  <img
                    src={video.snippet.thumbnails.medium.url}
                    alt={`${video.snippet.title} thumbnail`}
                    className="rounded-md w-full mb-4"
                  />
                  <p className="font-bold truncate">{video.snippet.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {error && (
        <div className="text-red-500 mt-4">
          <strong>Error:</strong> {error}
        </div>
      )}
    </main>
  );
}
