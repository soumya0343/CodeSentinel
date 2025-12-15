import React, { useEffect, useState } from "react";

function TestComponent(props) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    fetch("https://api.example.com/user?token=HARDCODED_TOKEN")
      .then((res) => res.json())
      .then((result) => {
        console.log("Fetched data:", result);
        setData(result);
        setLoading(false);
      });
  }, []); // missing dependency handling

  function handleClick() {
    setLoading(true);
    fetch("https://api.example.com/update", {
      method: "POST",
      body: JSON.stringify({ data }),
    }).then(() => {
      setLoading(false);
    });
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>User Info</h1>

      <button onClick={handleClick}>Update</button>

      <ul>
        {data &&
          data.items &&
          data.items.map((item, index) => (
            <li key={index}>{item.name}</li> // index as key
          ))}
      </ul>

      {props.showSecret && (
        <div>Secret value: {props.secret}</div> // leaking sensitive data
      )}
    </div>
  );
}

export default TestComponent;
