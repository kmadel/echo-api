# amazon-echo-api

This is (almost, kind of) an API for Amazon
Echo.

**This code is not for the faint of heart.** I wrote it in about three
hours, the day after I got my Echo, and there are a lot of
improvements to be made. The original goal was just a
proof-of-concept, to see if I could make Echo do what I wanted. My
goal with releasing the source is to help out other like-minded Echo
owners.

## Prerequisites

- **Connected by TCP Hub:** for control of Connected by TCP bulbs.

## Amazon Echo Credentials

I haven't integrated with any actual Amazon login systems yet. For
now, in order to connect this application to your Echo, you'll need to
do the following:

1. Using Chrome, go to http://echo.amazon.com and sign in.
1. Open the developer tools (Cmd+Shift+J on Mac, or Ctrl+Shift+J on
   Windows).
1. On the page, click on your Todo list.
1. In the network tab, clear all entries.
1. Add a new todo to the list. You should see a POST request in the
   network tab to https://pitangui.amazon.com/api/todos.
1. Right click on this request in the list, and select "Copy as cURL".
1. In a text editor, paste the cURL command from your clipboard, and
   copy the entire `Cookie: ...` header (excluding the "Cookie: "
   text).
1. Open `api/echo/.credentials.json` in your text editor (relative to
   wherever you checked out this repo).
1. Highlight `PasteEchoCookieHere` and paste from your
   clipboard. **This string has quotes in it; make sure to escape them
   before saving the file.**
1. Replace `CsrfValueGoesHere` with the CSRF value from the cookie
   string (should be a large negative integer).

## Other Credentials

Other credentials are located in `api/itunes/.credentials.json`.

## Running the App

This is a Node app, so (after adding the required credentials) running
the app is really just two steps:

1. Run `npm install` to install required packages.
1. Run `node app` to run the app.

## Todo

- actual Amazon login (rather than this cookie hack)
- better credential management overall
- "global" commands (that don't require a prefix)
- maybe get rid of the whole prefix idea altogether
- "scenes" (tasks that can call subtasks; i.e., set the lights *and*
  temperature)


