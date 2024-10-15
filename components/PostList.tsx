import React from 'react';
import { FlatList, RefreshControl, Text, View, Button, ScrollView } from 'react-native';
import PostTemplate from '@/components/PostTemplate';
import GradientTheme from '@/components/GradientTheme';

const PostList = ({ data, refreshing, onRefresh, likedPosts, reportedPosts, selfPosts, handleToggleLike, handleReportPost, handleDeletePost, router, section }) => {
    const renderItem = ({ item }) => {
        const isLiked = likedPosts.some(post => post.post_id === item.post_id);
        const isReported = reportedPosts.some(post => post.post_id === item.post_id);
        const isSelfPost = selfPosts.some(post => post.post_id === item.post_id); // Check if it's a self post

        return (
            <PostTemplate
                item={item}
                likes={item.likes}
                isSelfPost={isSelfPost}
                onDelete={handleDeletePost}
                onToggleLike={handleToggleLike}
                onReport={handleReportPost}
                isLiked={isLiked}
                isReported={isReported}
            />
        );
    };

    if (data.length === 0) {
        const buttonTitle = section === 'view' ? 'View posts now' : 'Make posts now';
        const route = section === 'view' ? '/(map)' : '/(map)/post';

        return (
            <GradientTheme>
                <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                    <Text>No posts available.</Text>
                    <View style={{ marginTop: '3%' }}>
                        <Button title={buttonTitle} onPress={() => router.push(route)} />
                    </View>
                </ScrollView>
            </GradientTheme>
        );
    }

    return (
        <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.post_id.toString()}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={{ alignItems: 'center' }}
        />
    );
};

export default PostList;
