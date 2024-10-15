import React, { useCallback } from 'react';
import GradientTheme from '@/components/GradientTheme';
import PostList from '@/components/PostList';
import { usePosts } from '@/hooks/usePosts';
import ErrorMessage from '@/components/ErrorMessage';
import { ActivityIndicator } from 'react-native';
import * as ColorScheme from '@/constants/ColorScheme';
import { useRouter } from 'expo-router';

export default function PostedScreen() {
    const { data, likedPosts, reportedPosts, selfPosts, refreshing, loading, error, handleToggleLike, handleDeletePost, handleReportPost, fetchPosts, fetchLikedPosts } = usePosts();  // No need for selfPosts here
    const router = useRouter();

    const onRefresh = useCallback(() => {
        fetchPosts();
        fetchLikedPosts();
    }, []);

    if (loading) {
        return <GradientTheme><ActivityIndicator size="large" color={ColorScheme.BTN_BACKGROUND} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} /></GradientTheme>;
    }

    if (error) {
        return <ErrorMessage error={error} onRetry={onRefresh} />;
    }

    return (
        <GradientTheme>
            <PostList
                data={data}
                refreshing={refreshing}
                onRefresh={onRefresh}
                likedPosts={likedPosts}
                reportedPosts={reportedPosts}
                selfPosts={data}  // all posts are self posts
                handleToggleLike={handleToggleLike}
                handleReportPost={handleReportPost}
                handleDeletePost={handleDeletePost}
                router={router}
            />
        </GradientTheme>
    );
}
