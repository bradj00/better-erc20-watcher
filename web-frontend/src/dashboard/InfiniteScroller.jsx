import React, { useState, useEffect } from 'react';

function InfiniteScroll() {
  const [CoolData, setCoolData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getCoolData(page).then((data) => {
      setCoolData([...CoolData, ...data]);
      setPage(page + 1);
      setLoading(false);
    });
  }, [page]);

  return (
    <div className="infinite-scroll">
      {CoolData.map((data) => (
        <div key={data.id}>{data.name}</div>
      ))}
      {loading && <div>Loading...</div>}
    </div>
  );
}

async function getCoolData(page) {
  const response = await fetch(
    `https://my-cool-api.com/coolData?page=${page}`
  );
  const data = await response.json();
  return data;
}

export default InfiniteScroll;