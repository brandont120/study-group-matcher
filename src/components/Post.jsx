export default function Post({post}){
    return(
        <div>
            <h2>{post.author}</h2>
            <p>{post.content}</p>
            <hr />
        </div>
    );
}