import { useState } from "react";
import { useSearchPostsQuery } from "../redux/api"

const LIMIT = 10;

export const SearchPostsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const { data, error, isLoading, isFetching } = useSearchPostsQuery({ skip: page * LIMIT, limit: LIMIT });

  return (
    <div>
      <h1>Search Posts Page</h1>
      {isLoading && <div>Loading...</div>}
      {isFetching && <div>Fetching...</div>}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {data && (
        <div>
          {data.posts.map((post) => (
            <div key={post.id}>{post.title}</div>
          ))}
        </div>
      )}
      <button onClick={() => setPage(page - 1)} disabled={page === 0}>Previous</button>
      <button onClick={() => setPage(page + 1)}>Next</button>
      <p>Page: {page + 1}</p>
    </div>
  )
}