const page = () => {
  return (
    <div>
      <h1>Minimal Test Page</h1>
      <p>This should work without any layout.</p>
      <p>Time: {new Date().toISOString()}</p>
    </div>
  );
};

export default page;
