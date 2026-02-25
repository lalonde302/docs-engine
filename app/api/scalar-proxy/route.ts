const HOP_BY_HOP_HEADERS = new Set([
	'connection',
	'keep-alive',
	'proxy-authenticate',
	'proxy-authorization',
	'te',
	'trailer',
	'transfer-encoding',
	'upgrade',
]);

function buildProxyHeaders(request: Request) {
	const headers = new Headers(request.headers);

	for (const name of HOP_BY_HOP_HEADERS) {
		headers.delete(name);
	}

	headers.delete('host');
	headers.delete('origin');
	headers.delete('referer');
	headers.delete('content-length');

	const scalarCookie = headers.get('x-scalar-cookie');
	if (scalarCookie) {
		headers.set('cookie', scalarCookie);
		headers.delete('x-scalar-cookie');
	}

	return headers;
}

function getTargetUrl(requestUrl: string) {
	const url = new URL(requestUrl);
	const target = url.searchParams.get('scalar_url');

	if (!target) {
		return null;
	}

	try {
		return new URL(target);
	} catch {
		return null;
	}
}

async function proxyRequest(request: Request) {
	const targetUrl = getTargetUrl(request.url);

	if (!targetUrl) {
		return new Response('Missing or invalid scalar_url', { status: 400 });
	}

	const init: RequestInit = {
		method: request.method,
		headers: buildProxyHeaders(request),
		redirect: 'follow',
	};

	if (request.method !== 'GET' && request.method !== 'HEAD') {
		init.body = request.body;
	}

	const response = await fetch(targetUrl, init);
	const responseHeaders = new Headers(response.headers);

	responseHeaders.delete('set-cookie');

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: responseHeaders,
	});
}

export async function GET(request: Request) {
	return proxyRequest(request);
}

export async function POST(request: Request) {
	return proxyRequest(request);
}

export async function PUT(request: Request) {
	return proxyRequest(request);
}

export async function PATCH(request: Request) {
	return proxyRequest(request);
}

export async function DELETE(request: Request) {
	return proxyRequest(request);
}

export async function OPTIONS() {
	return new Response(null, { status: 204 });
}
