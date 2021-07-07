const express = require("express");
const cors = require("cors");
const { Thread } = require("./model");
const { json } = require("express");

const server = express();

server.use(cors());
server.use(express.json({}));

// this is where we will do our own middleware
server.use((req, res, next) => {
  console.log(
    "Time: ",
    Date.now(),
    " - Method: ",
    req.method,
    " - Path: ",
    req.originalUrl,
    " - Body: ",
    req.body
  );
  next();
});

// GET /thread
server.get("/thread", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  console.log("getting all threads");
  Thread.find({}, (err, threads) => {
    // check if error is null
    if (err != null) {
      res.status(500).json({
        error: err,
        message: "could not list threads",
      });
      return;
    }
    // success
    res.status(200).json(threads);
  });
});

// GET /thread/:id
server.get("/thread/:id", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  console.log(`getting thread with id ${req.params.id}`);
  Thread.findById(req.params.id, (err, thread) => {
    if (err != null) {
      res.status(500).json({
        error: err,
        message: "could not get thread",
      });
      return;
    } else if (thread === null) {
      res.status(404).json({
        error: err,
        message: "could not find thread",
      });
      return;
    }
    res.status(200).json(thread);
  });
});

// POST /thread
server.post("/thread", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  console.log(`creating thread with body`, req.body);
  Thread.create(
    {
      name: req.body.name || "",
      description: req.body.description || "",
      author: req.body.author || "",
      category: req.body.category || "",
    },
    (err, thread) => {
      if (err != null) {
        res.status(500).json({
          message: `post request failed to create thread`,
          error: err,
        });
        return;
      }
      res.status(201).json(thread);
    }
  );
});

// DELETE /thread/:id
server.delete("/thread/:id", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  console.log(`deleting thread with id ${req.params.id}`);
  Thread.findByIdAndDelete(req.params.id, (err, thread) => {
    if (err != null) {
      res.status(500).json({
        error: err,
        message: "could not delete thread",
      });
      return;
    } else if (thread === null) {
      res.status(400).json({
        error: err,
        message: "could not delete thread",
      });
      return;
    }
    res.status(200).json(thread);
  });
});

// POST /post
server.post("/post", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  console.log(`creating post with body`, req.body);

  let newPost = {
    author: req.body.author || "",
    body: req.body.body || "",
    thread_id: req.body.thread_id || "",
  };

  Thread.findByIdAndUpdate(
    req.body.thread_id,
    {
      $push: { posts: newPost },
    },
    {
      new: true,
    },
    (err, thread) => {
      if (err != null) {
        res.status(500).json({
          error: err,
          message: "could not add post",
        });
        return;
      } else if (thread === null) {
        res.status(404).json({
          error: err,
          message: "could not find thread",
        });
        return;
      }
      res.status(200).json(thread.posts[thread.posts.length - 1]);
    }
  );
});

// DELETE /post/:thread_id/:post_id
server.delete("/post/:thread_id/:post_id", (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  console.log(
    `deleting post with id ${req.params.post_id} on thread with id ${req.params.thread_id}`
  );
  Thread.findByIdAndUpdate(
    req.params.thread_id,
    {
      $pull: {
        posts: {
          _id: req.params.post_id,
        },
      },
    },
    (err, thread) => {
      if (err != null) {
        res.status(500).json({
          error: err,
          message: "could not delete post",
        });
        return;
      } else if (thread === null) {
        res.status(404).json({
          error: err,
          message: "could not find thread",
        });
        return;
      }
      // find the post that was deleted
      let post;
      thread.posts.forEach((e) => {
        if (e._id == req.params.post_id) {
          post = e;
        }
      });
      // if you can't find it return 404
      if (post == undefined) {
        res.status(404).json({
          error: err,
          message: "could not find post",
        });
        return;
      }
      // success
      res.status(200).json(post);
    }
  );
});

server.use((req, res) => {
  console.log("handle error");
});

module.exports = server;