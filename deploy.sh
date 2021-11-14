#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run docs:build

# navigate into the build output directory
cd docs/.vuepress/dist

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages
# 强推到当前项目
git push -f git@github.com:wecom-sidebar/wecom-sidebar-docs.git master:gh-pages
# 强推到 index
git push -f git@github.com:wecom-sidebar/wecom-sidebar.github.io.git

cd -
