export default function ContentPreviewPage({ params }) {
  const { id } = params;

  return (
    <div>
      <h1>Content Preview: {id}</h1>
      <div className="bg-black w-[300px] h-[533px] my-4 flex items-center justify-center text-white">
        <p>Video Player Placeholder</p>
      </div>
      <div className="flex gap-4">
        <button className="px-4 py-2 bg-green-600 text-white border-none rounded cursor-pointer">Approve</button>
        <button className="px-4 py-2 bg-red-600 text-white border-none rounded cursor-pointer">Reject</button>
        <a href={`/api/download/${id}`} download className="px-4 py-2 bg-gray-500 text-white no-underline rounded">Download MP4</a>
      </div>
    </div>
  );
}
