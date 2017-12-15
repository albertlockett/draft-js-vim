import path from 'path';
import webpack from 'webpack';

export default {
  entry: [
    path.join(__dirname, 'src', 'app', 'index.tsx')
  ],
  target: 'web',
  output: {
    path: path.join(__dirname, 'lib', 'docbase'),
    publicPath: '/',
    filename: 'bundle.js'
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"]
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          { loader: "style-loader" }, 
          { loader: "css-loader" }, 
          { loader: "sass-loader" }
        ]
      },
      { 
        test: /\.tsx?$/, 
        loader: "awesome-typescript-loader",
        options: {
          configFileName: "tsconfig.json"
        }
      },
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
    ]
  },
};