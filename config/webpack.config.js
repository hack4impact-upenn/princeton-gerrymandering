const path = require("path");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    entry: {
        main: "./client/index.tsx"
    },
    // Change to production in production
    mode: "development",
    output: {
        filename: "main-bundle.js",
        path: path.resolve(__dirname, "../client/dist"),
        publicPath: "/"
    },
    devServer: {
        contentBase: "client/dist",
        publicPath: "/static",
        overlay: true,
        stats: {
            colors: true
        },
        watchContentBase: true,
        proxy: {
            '/api': 'http://localhost:5000',
        },
        historyApiFallback: {
            index: 'index.html'
        }
    },
    module: {
        rules: [
            {
                test: /\.(less|css)$/,
                use: [{
                    loader: 'style-loader',
                }, {
                    loader: 'css-loader', // translates CSS into CommonJS
                }, {
                    loader: 'less-loader', // compiles Less to CSS
                    options: {
                        modifyVars: {
                            'hack': `true; @import "${require.resolve("../client/styles/overrides.less")}";`
                        },
                        javascriptEnabled: true,
                    },
                }]
            },
            {
                test: /\.js|tsx$/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ['@babel/preset-env'],
                            cacheDirectory: true,
                            plugins: [
                                ['import', { libraryName: "antd", style: true }]
                            ]
                        }
                    }
                ],

                exclude: /node_modules/
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    'file-loader',
                ],
            },
            {
                test: /\.svg$/,
                use: ['@svgr/webpack'],
            },
            {
                test: /\.(eot|woff|woff2|ttf|svg|png|jpg)$/,
                loader: 'url-loader?limit=30000&name=[name]-[hash].[ext]'
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        // new BundleAnalyzerPlugin()
    ]
}
