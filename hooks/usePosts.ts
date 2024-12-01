import { useState, useEffect } from 'react';
import { API_LINK } from '@/constants/API_link';
import { useAuth } from '@/components/accAuth';
import { Alert } from 'react-native';

export const usePosts = (postType = '', includeSelfPosts = false) => {
    const [data, setData] = useState([]);
    const [likedPosts, setLikedPosts] = useState([]);
    const [reportedPosts, setReportedPosts] = useState([]);
    const [selfPosts, setSelfPosts] = useState([]);  // Track user's own posts
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userToken } = useAuth();

    // Fetch posts based on type
    const fetchPosts = async () => {
        try {
            const response = await fetch(`${API_LINK}/posts${postType}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const jsonResponse = await response.json();
                setData(jsonResponse.data);
                setError(null);
            } else {
                const errorResponse = await response.json();
                setError(errorResponse.error || 'Failed to load posts.');
            }
        } catch (err) {
            setError('Failed to fetch posts.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Optionally fetch user's own posts
    const fetchSelfPosts = async () => {
        if (!includeSelfPosts) return;  // Skip fetching self posts if not needed
        try {
            const response = await fetch(`${API_LINK}/posts`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const jsonResponse = await response.json();
                setSelfPosts(jsonResponse.data);
            } else {
                const errorResponse = await response.json();
                Alert.alert('Error', errorResponse.error || 'Failed to fetch self posts.');
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to connect to the server.');
        }
    };

    // Optionally fetch user's liked posts
    const fetchLikedPosts = async () => {
        try {
            const response = await fetch(`${API_LINK}/posts/like`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const jsonResponse = await response.json();
                setLikedPosts(jsonResponse.data);
            } else {
                const errorResponse = await response.json();
                Alert.alert('Error', errorResponse.error || 'Failed to fetch liked posts.');
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to connect to the server.');
        }
    };

    // Optionally fetch user's reported posts
    const fetchReportedPosts = async () => {
        try {
            const response = await fetch(`${API_LINK}/posts/report`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const jsonResponse = await response.json();
                setReportedPosts(jsonResponse.data);
            } else {
                const errorResponse = await response.json();
                Alert.alert('Error', errorResponse.error || 'Failed to fetch reported posts.');
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to connect to the server.');
        }
    };

    // Toggle like status for a post
    const handleToggleLike = async (postId) => {
        try {
            const response = await fetch(`${API_LINK}/posts/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ post_id: postId }),
            });

            if (response.ok) {
                const jsonResponse = await response.json();
                const updatedLikedPosts = jsonResponse.liked
                    ? [...likedPosts, { post_id: postId }]
                    : likedPosts.filter(post => post.post_id !== postId);

                setLikedPosts(updatedLikedPosts);

                // Update the likes count in the data array
                setData(prevPosts =>
                    prevPosts.map(post =>
                        post.post_id === postId
                            ? { ...post, likes: jsonResponse.liked ? post.likes + 1 : post.likes - 1 }
                            : post
                    )
                );
            } else {
                const errorResponse = await response.json();
                Alert.alert('Error', errorResponse.error || 'Failed to toggle like.');
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to connect to the server.');
        }
    };

    // Function to handle deleting a post
    const handleDeletePost = async (postId) => {
        try {
            const response = await fetch(`${API_LINK}/posts`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: postId }),
            });

            if (response.ok) {
                Alert.alert('Success', 'Post deleted successfully.');
                setData(data.filter(post => post.post_id !== postId));
            } else {
                const errorResponse = await response.json();
                Alert.alert('Error', errorResponse.error || 'Failed to delete the post.');
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to connect to the server.');
        }
    };

    // Handle reporting a post
    // This function is considered as ethical consideration, we won't know what user will post on community.
    // So this function can let user report some unethical comment.
    const handleReportPost = async (item, reportComment, onSuccess) => {
        if (!reportComment.trim()) {
            Alert.alert('Error', 'Report comment cannot be empty.');
            return;
        }

        try {
            const response = await fetch(`${API_LINK}/posts/report`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    post_id: item.post_id,
                    report_comment: reportComment,
                }),
            });

            if (response.ok) {
                Alert.alert('Success', 'Post reported successfully.');
                // Mark the post as reported locally
                setReportedPosts((prev) => [...prev, item]);

                if (onSuccess) {
                    onSuccess(); // Call onSuccess to close modal and clear comment
                }
            } else {
                const errorResponse = await response.json();
                Alert.alert('Error', errorResponse.error || 'Failed to report the post.');
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to connect to the server.');
        }
    };

    useEffect(() => {
        if (userToken) {
            fetchPosts();
            fetchSelfPosts();  // Fetch self posts if required
            fetchLikedPosts();
            fetchReportedPosts();
        }
    }, [userToken]);

    return { data, likedPosts, reportedPosts, selfPosts, refreshing, loading, error, handleToggleLike, handleDeletePost, handleReportPost, fetchPosts, fetchSelfPosts, fetchLikedPosts, fetchReportedPosts };
};
