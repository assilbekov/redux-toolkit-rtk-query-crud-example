import { useListPostsQuery } from "../redux/api";

type PostsPageProps = {
  onPostClick: (id: number) => void;
}

export const PostsPage: React.FC<PostsPageProps> = ({ onPostClick }) => {
  const { data, error, isLoading, isFetching } = useListPostsQuery();

  return (
    <div>
      <h1>Posts Page</h1>
      {isLoading && <div>Loading...</div>}
      {isFetching && <div>Fetching...</div>}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {data && (
        <div>
          {data.posts.map((post) => (
            <div key={post.id} onClick={() => onPostClick(post.id)}>{post.title}</div>
          ))}
        </div>
      )}
    </div>
  )
}