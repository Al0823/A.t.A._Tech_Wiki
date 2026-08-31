// content.js — PHP API client

function apiBase() {return window.location.origin + "/";}

async function apiFetch(path, options) {

    options = options || {};

    var base = apiBase();

    path = path.replace(/^\/+/, "");

    var headers = Object.assign(
        {
            "Content-Type": "application/json"
        },
        options.headers || {}
    );

    var res = await fetch(
        base + path,
        Object.assign(
            {},
            options,
            {
                headers: headers
            }
        )
    );

    if (!res.ok) {

        var contentType =
            res.headers.get("Content-Type") || "";

        if (
            contentType.indexOf("application/json") === -1
        ) {
            throw new Error(
                "Server returned HTTP " +
                res.status
            );
        }

        var err =
            await res.json().catch(function() {
                return {
                    error: res.statusText
                };
            });

        throw new Error(
            err.error || res.statusText
        );
    }

    return res.json();
}

// Auth 

async function login(uname, pword) {
	var data = await apiFetch("/auth/login.php",{
    method: "POST",
    body: JSON.stringify({ uname: uname, pword: pword })
  });
  localStorage.setItem("authToken", data.token);
  localStorage.setItem("authUser",  JSON.stringify(data.user));
  return data.user;
}

async function signup(fname, lname, email, uname, pword) {
  var data = await apiFetch("/auth/signup.php",{
    method: "POST",
    body: JSON.stringify({ fname: fname, lname: lname, email: email, uname: uname, pword: pword })
  });
  localStorage.setItem("authToken", data.token);
  localStorage.setItem("authUser",  JSON.stringify(data.user));
  return data.user;
}

function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
}

function getUser() {
  try { return JSON.parse(localStorage.getItem("authUser")); } catch(e) { return null; }
}

function isLoggedIn() { return !!getUser(); }
function isAdmin()    { return !!(getUser() && getUser().ADMIN === "1"); }

// Public pages

async function loadPageList(containerId, searchQuery) {

    searchQuery = searchQuery || "";

    var container =
        document.getElementById(containerId);

    if (!container) return;

    container.innerHTML = "Loading...";

    try {

        var url =
            "utils/pages-list.php";

        if (searchQuery) {

            url +=
                "?search=" +
                encodeURIComponent(searchQuery);
        }

        var pages =
            await apiFetch(url);

        if (pages.length === 0) {

            container.innerHTML =
                searchQuery
                    ? "<p>No results for \"" +
                      "<b>" +
                      esc(searchQuery) +
                      "</b>\".</p>"
                    : "<p>No pages found.</p>";

            return;
        }

        var heading =
            searchQuery
                ? "<p><b>" +
                  pages.length +
                  "</b> result(s) for \"" +
                  "<b>" +
                  esc(searchQuery) +
                  "</b>\"</p>"
                : "";

        container.innerHTML =
            heading +
            pages.map(function(p) {

                return (
                    "<a href=\"" +
                    window.vars.PATHVAR +
                    "content/pagedetail.html?sku=" +
                    encodeURIComponent(p.SKU) +
                    "\">" +
                    esc(p.TITLE) +
                    "</a><br><br>"
                );

            }).join("");

    } catch (err) {

        container.innerHTML =
            "<p class=\"error\">" +
            esc(err.message) +
            "</p>";
    }
}

async function loadPageDetail(sku) {

    var articleEl =
        document.getElementById("pageContent");

    var commentsEl =
        document.getElementById("commentsList");

    if (!articleEl) return;

    try {

        var page =
            await apiFetch(
                "utils/page.php?sku=" +
                encodeURIComponent(sku)
            );

        document.title =
            page.TITLE;

        articleEl.innerHTML =
            "<h2>" +
            esc(page.TITLE) +
            "</h2>" +
            page.BODYCOPY;

        /*
         * Comments will be converted separately.
         */

    } catch (err) {

        articleEl.innerHTML =
            "<p class=\"error\">" +
            esc(err.message) +
            "</p>";
    }
}

// Comments 

async function loadComments(pageSku, container) {
  container.innerHTML = "Loading comments...";
  try {
    var comments = await apiFetch(
      "/comments/index.php?pageSku=" +
      encodeURIComponent(pageSku)
    );

    if (comments.length === 0) {
      container.innerHTML = "<p>No comments yet.</p>";
      return;
    }

    container.innerHTML = comments.map(function(c) {
      return "<div class=\"comment\"><b>" + esc(c.AUTHOR) + "</b>" +
        "<span class=\"comment-date\"> — " + esc(c.CREATEDATE) + " " + esc(c.CREATETIME) + "</span>" +
        "<p>" + esc(c.COMMENT) + "</p><hr></div>";
    }).join("");

  } catch(err) {
    container.innerHTML = "<p class=\"error\">" + esc(err.message) + "</p>";
  }
}

async function submitComment(pageSku, comment) {
  if (!isLoggedIn()) throw new Error("You must be logged in to comment");
  return apiFetch("/comments/add.php", { method: "POST", body: JSON.stringify({ pageSku: pageSku, comment: comment }) });
}

// Pub (own-content) pages 

async function pubGetPages() {
  return apiFetch("/pub/pages/index.php");
}
async function pubAddPage(title, bodycopy) {
  return apiFetch("/pub/pages/add.php", { method: "POST", body: JSON.stringify({ title: title, bodycopy: bodycopy }) });
}
async function pubEditPage(sku, title, bodycopy) {
  return apiFetch("/pub/pages/edit.php", {
    method: "POST",
    body: JSON.stringify({
      sku: sku,
      title: title,
      bodycopy: bodycopy
    })
  });
}
async function pubDeletePage(sku) {
  return apiFetch(
    "/pub/pages/delete.php?sku=" +
    encodeURIComponent(sku),
    {
      method: "POST"
    }
  );
}

// Admin 

async function adminGetMembers() {
  return apiFetch("/admin/members/index.php");
}
async function adminAddMember(data) {
  return apiFetch("/admin/members/add.php", {
    method: "POST",
    body: JSON.stringify(data)
  });
}
async function adminEditMember(sku, data) {

  data.sku = sku;

  return apiFetch(
    "/admin/members/edit.php",
    {
      method: "POST",
      body: JSON.stringify(data)
    }
  );
}
async function adminDeleteMember(sku) {
  return apiFetch(
    "/admin/members/delete.php?sku=" +
    encodeURIComponent(sku),
    {
      method: "POST"
    }
  );
}

async function adminGetPages() {
  return apiFetch("/admin/pages/list.php");
}
async function adminAddPage(data) {
  return apiFetch(
    "/admin/pages/add.php",
    {
      method: "POST",
      body: JSON.stringify(data)
    }
  );
}
async function adminEditPage(sku, data) {

  data.sku = sku;

  return apiFetch(
    "/admin/pages/edit.php",
    {
      method: "POST",
      body: JSON.stringify(data)
    }
  );
}
async function adminDeletePage(sku) {
  return apiFetch(
    "/admin/pages/delete.php",
    {
      method: "POST",
      body: JSON.stringify({
        sku: sku
      })
    }
  );
}

// Guards 

function requireLogin(redirectPath) {
  if (!isLoggedIn()) {
    window.location.href = redirectPath || (window.vars.PATHVAR + "login/index.html");
  }
}

function requireAdmin() {
  if (!isAdmin()) window.location.href = window.vars.PATHVAR + "index.html";
}

// Utility

function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function getSkuFromUrl() {
  return new URLSearchParams(window.location.search).get("sku");
}

window.login            = login;
window.signup           = signup;
window.logout           = logout;
window.getUser          = getUser;
window.isLoggedIn       = isLoggedIn;
window.isAdmin          = isAdmin;
window.requireLogin     = requireLogin;
window.requireAdmin     = requireAdmin;
window.loadPageList     = loadPageList;
window.loadPageDetail   = loadPageDetail;
window.loadComments     = loadComments;
window.submitComment    = submitComment;
window.pubGetPages      = pubGetPages;
window.pubAddPage       = pubAddPage;
window.pubEditPage      = pubEditPage;
window.pubDeletePage    = pubDeletePage;
window.adminGetMembers  = adminGetMembers;
window.adminAddMember   = adminAddMember;
window.adminEditMember  = adminEditMember;
window.adminDeleteMember = adminDeleteMember;
window.adminGetPages    = adminGetPages;
window.adminAddPage     = adminAddPage;
window.adminEditPage    = adminEditPage;
window.adminDeletePage  = adminDeletePage;
window.getSkuFromUrl    = getSkuFromUrl;
window.esc              = esc;