interface Body<TVariables> {
  query: string;
  variables?: TVariables;
}

interface Error {
  message: string;
}

export const server = {
  fetch: async <TData = any, TVariables = any>(body: Body<TVariables>) => {
    const res = await fetch("/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // catch errors from server connection, etc
    if (!res.ok) {
      throw new Error("Failed to fetch from server");
    }

    return res.json() as Promise<{
      data: TData;
      // catch errors if res is ok, but graphql response contains errors
      errors: Error[];
    }>;
  },
};
