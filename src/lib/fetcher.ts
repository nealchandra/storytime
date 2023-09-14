export const fetcherGet = async (url: string) => {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const info = res.statusText;
    const message = `Error; status=${res.status}; info=${info}`;
    throw new Error(message);
  }

  return res.json();
};

export const fetcherPost = async ([url, params]: [string, any]) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const info = res.statusText;
    const message = `Error; status=${res.status}; info=${info}`;
    throw new Error(message);
  }

  return res.json();
};
