type PagesEnv = {
  API_ORIGIN?: string;
};

function shouldProxy(pathname: string): boolean {
  return (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/uploads/") ||
    pathname.startsWith("/auntie-photos/")
  );
}

function hasRequestBody(method: string): boolean {
  return method !== "GET" && method !== "HEAD";
}

export const onRequest: PagesFunction<PagesEnv> = async (context) => {
  const { request, env, next } = context;
  const url = new URL(request.url);

  if (!shouldProxy(url.pathname)) {
    return next();
  }

  const apiOrigin = env.API_ORIGIN;
  if (!apiOrigin) {
    return new Response("Missing Pages env: API_ORIGIN", { status: 500 });
  }

  const target = new URL(`${url.pathname}${url.search}`, apiOrigin);
  const reqHeaders = new Headers(request.headers);
  reqHeaders.set("host", target.host);

  const upstream = await fetch(target.toString(), {
    method: request.method,
    headers: reqHeaders,
    body: hasRequestBody(request.method) ? request.body : null,
    redirect: "manual",
  });

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: upstream.headers,
  });
};
