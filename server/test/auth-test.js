// Simple auth route integration test using fetch and cookie handling.
// Usage: BASE_URL=http://localhost:3000 node test/auth-test.js

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

function parseSetCookie(setCookie) {
	if (!setCookie) return {};
	// setCookie may be an array
	const raw = Array.isArray(setCookie) ? setCookie[0] : setCookie;
	const parts = raw.split(";").map((p) => p.trim());
	const [nameValue, ...attrs] = parts;
	const [name, value] = nameValue.split("=");
	const cookie = { name, value, attrs };
	return cookie;
}

async function request(path, opts = {}, cookies = {}) {
	const headers = opts.headers || {};
	if (Object.keys(cookies).length) {
		const cookieHeader = Object.entries(cookies)
			.map(([k, v]) => `${k}=${v}`)
			.join("; ");
		headers["cookie"] = cookieHeader;
	}
	const res = await fetch(BASE_URL + path, { ...opts, headers, redirect: "manual" });
	const setCookie = res.headers.get("set-cookie") || res.headers.get("Set-Cookie");
	const cookieObj = parseSetCookie(setCookie);
	let body = null;
	try {
		body = await res.json();
	} catch (e) {
		body = await res.text();
	}
	return { res, body, cookie: cookieObj };
}

async function run() {
	console.log("Base URL:", BASE_URL);

	// Test data
	const user = {
		name: "Test User",
		email: `test+${Date.now()}@example.com`,
		password: "P@ssw0rd!",
	};

	console.log("1) Signup");
	const signup = await request("/auth/signup", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(user),
	});
	console.log("signup status:", signup.res.status);
	console.log("signup body:", signup.body);
	if (signup.res.status >= 400) process.exit(1);

	console.log("2) Login");
	const login = await request(
		"/auth/login",
		{
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ email: user.email, password: user.password }),
		},
		{}
	);
	console.log("login status:", login.res.status);
	console.log("login body:", login.body);
	if (login.res.status >= 400) process.exit(1);

	const cookies = {};
	if (login.cookie && login.cookie.name) cookies[login.cookie.name] = login.cookie.value;
	console.log("received cookie:", login.cookie);

	console.log("3) Refresh (using cookie)");
	const refresh = await request("/auth/refresh", { method: "POST" }, cookies);
	console.log("refresh status:", refresh.res.status);
	console.log("refresh body:", refresh.body);
	if (refresh.res.status >= 400) process.exit(1);
	if (refresh.cookie && refresh.cookie.name) cookies[refresh.cookie.name] = refresh.cookie.value;


	// 4) Forgot password -> reset -> login with new password
	console.log("4) Forgot password (request reset token)");
	const forgot = await request(
		"/auth/forgot",
		{
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ email: user.email }),
		},
		{}
	);
	console.log("forgot status:", forgot.res.status);
	console.log("forgot body:", forgot.body);
	if (forgot.res.status >= 400) process.exit(1);

	// In dev the token is returned in body.data.resetToken
	const resetToken = forgot.body?.data?.resetToken;
	if (!resetToken) {
		console.error("No reset token returned by /auth/forgot");
		process.exit(1);
	}

	console.log("5) Reset password (using token)");
	const newPassword = "N3wP@ssw0rd!";
	const reset = await request(
		"/auth/reset",
		{
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ token: resetToken, newPassword }),
		},
		{}
	);
	console.log("reset status:", reset.res.status);
	console.log("reset body:", reset.body);
	if (reset.res.status >= 400) process.exit(1);

	console.log("6) Login with new password");
	const relogin = await request(
		"/auth/login",
		{
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ email: user.email, password: newPassword }),
		},
		{}
	);
	console.log("relogin status:", relogin.res.status);
	console.log("relogin body:", relogin.body);
	if (relogin.res.status >= 400) process.exit(1);

	console.log("7) Logout (using cookie)");
	const logout = await request("/auth/logout", { method: "POST" }, cookies);
	console.log("logout status:", logout.res.status);
	console.log("logout body:", logout.body);

	console.log("All done.");
}

run().catch((err) => {
	console.error(err);
	process.exit(1);
});
