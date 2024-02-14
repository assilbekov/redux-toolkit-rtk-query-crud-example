import { useState } from "react";
import { AuthPage, PostPage, PostsPage, SearchPostsPage } from "./pages"
import { CreatePost } from "./pages/CreatePost";
import { userSelector } from "./redux/authSlice"
import { useAppSelector } from "./redux/hooks"

export const App: React.FC = () => {
  const user = useAppSelector(userSelector);
  const [postId, setPostId] = useState<number | null>(null)

  return (
    <div>
      <h1>App. Need login first</h1>
      <AuthPage />
      {user && (
        <div>
          <h1>Logged in as {user.username}</h1>
          <CreatePost />
          <PostPage postId={postId} />
          <PostsPage onPostClick={setPostId} />
          <SearchPostsPage />
        </div>
      )}
    </div>
  )
}