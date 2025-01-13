import { Playlist, Video, YouTubeVideoResponse } from "@/types/youtube";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

export default function Playlists({ playlists }: { playlists: Playlist[] }) {
	const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
	const [videos, setVideos] = useState<Video[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [modalOpen, setModalOpen] = useState(false);

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

	return <>
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
	</>
}