export interface Playlist {
    id: string;
    snippet: {
        title: string;
        description: string;
        thumbnails: {
            medium: {
                url: string;
            };
        };
    };
    contentDetails: {
        itemCount: number;
    };
}

export interface YouTubeAPIResponse {
    items: Playlist[];
}

export interface Video {
    id: {
        videoId: string;
    };
    snippet: {
        title: string;
        description: string;
        thumbnails: {
            medium: {
                url: string;
            };
        };
    };
}

export interface YouTubeVideoResponse {
    items: Video[];
}