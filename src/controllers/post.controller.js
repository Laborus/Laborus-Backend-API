const Post = require("../models/post.model");
const {
  successResponseWithData,
  errorResponse,
} = require("../utils/api.response");

// Get post by ID

exports.postById = async (req, res) => {
  try {
    const postId = req.params.id;

    if (!postId) {
      return errorResponse(res, "INVALID_ID", "The provided ID is invalid.");
    }

    const post = await Post.findById(postId);

    if (!post) {
      return errorResponse(res, "NOT_FOUND", "Post not found.");
    }

    successResponseWithData(res, "Post retrieved successfully.", post);
  } catch (error) {
    console.error(error);
    errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

// Get all posts with filter

exports.getAllPosts = async (req, res) => {
  try {
    const { postedOn, likes, commentsEnabled } = req.query;
    let filter = {};
    const limit = parseInt(req.query.limit) || 25;

    if (postedOn) {
      filter.postedOn = postedOn;
    }

    if (req.query.userId) {
      filter.postedBy = req.query.userId;
    }

    if (likes) {
      const [minLikes, maxLikes] = likes.split(",").map(Number);
      filter.likes = {
        $gte: minLikes || 0,
        $lte: maxLikes || Number.MAX_VALUE,
      };
    }

    if (commentsEnabled !== undefined) {
      filter.commentsEnabled = commentsEnabled === "true";
    }

    const totalCount = await Post.countDocuments(filter);

    const posts = await Post.find(filter).limit(limit);

    successResponseWithData(res, "Posts retrieved successfully.", {
      results: totalCount,
      posts,
    });
  } catch (error) {
    console.error(error);
    errorResponse(res, "INTERNAL_SERVER_ERROR");
  }
};

const Post = require('../models/post.model');
const { successResponseWithData, errorResponse } = require('../helpers/apiResponse');

exports.createPost = async (req, res) => {
    try {
        const { title, textContent, postedOn, image, video, postedBy } = req.body;

        // Conversão da imagem e vídeo de base64 para Buffer
        const imageData = image ? {
            data: Buffer.from(image, 'base64'),
            contentType: 'image/jpeg', // Ajuste o tipo de acordo com a imagem que você estiver recebendo
        } : null;

        const videoData = video ? {
            data: Buffer.from(video, 'base64'),
            contentType: 'video/mp4', // Ajuste o tipo de acordo com o vídeo que você estiver recebendo
        } : null;

        const newPost = new Post({
            title,
            textContent,
            postedOn,
            image: imageData,
            video: videoData,
            postedBy,
        });

        const savedPost = await newPost.save();

        return successResponseWithData(res, 'Post created successfully', savedPost);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};


// exports.updatePost = (req, res) => {};

// exports.deletePost = (req, res) => {};

// exports.like = (req, res) => {};

// exports.unlike = (req, res) => {};

// exports.sharePost = (req, res) => {};

// exports.reportPost = (req, res) => {};
