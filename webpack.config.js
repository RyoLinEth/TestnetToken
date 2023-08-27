module.exports = {
    module: {
      rules: [
        {
          loader: "worker-loader",
          options: { publicPath: "/worker/" },
        },
      ],
    },
  };