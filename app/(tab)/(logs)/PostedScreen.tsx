import React, { useCallback, useEffect } from 'react';
import GradientTheme from '@/components/GradientTheme';
import PostList from '@/components/PostList';
import { usePosts } from '@/hooks/usePosts';
import ErrorMessage from '@/components/ErrorMessage';
import { ActivityIndicator } from 'react-native';
import * as ColorScheme from '@/constants/ColorScheme';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import * as RN from 'react-native';

export default function PostedScreen() {
    const { data, likedPosts, reportedPosts, selfPosts, refreshing, loading, error,
        handleToggleLike, handleDeletePost, handleReportPost, fetchPosts,
        fetchLikedPosts } = usePosts();
    const route = useRoute();
    const router = useRouter();

    // Get params passed when navigating to this screen
    const { directRefresh } = route.params || {};

    const onRefresh = useCallback(() => {
        fetchPosts();
        fetchLikedPosts();
    }, []);

    // Trigger refresh when the screen is focused (navigated to) with `directRefresh` param
    useFocusEffect(
        useCallback(() => {
            if (directRefresh) {
                onRefresh();
            }
        }, [directRefresh, onRefresh])
    );

    if (loading) {
        return
        <GradientTheme>
            <ActivityIndicator
                size="large"
                color={ColorScheme.BTN_BACKGROUND}
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            />
        </GradientTheme>;
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
            {/*<RN.Text style={{color: 'grey'}} onPress={() => RN.Linking.openURL('https://wallpapers.com/png/open-hand-gesture-emoji-x6a7if3pzucpm0v8.html')}>*/}
            {/*    Wallpaper by se224340 on Wallpapers.com*/}
            {/*</RN.Text>*/}
        </GradientTheme>
    );
}
