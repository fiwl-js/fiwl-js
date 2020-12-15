<p align="center">
  <img src="/BANNER.png" alt="Banner">
</p>

<h1 align="center">FIWL JS</h1>
<p align="center">
  FIWL (Flexible Interactive Web Layout) extends XML standard, mainly purposed for arranging web app layout as efficient as possible.
</p>

<p align="center">
<a href="https://github.com/fiwl-js/fiwl-js/stargazers">
<img
      src="https://img.shields.io/github/stars/fiwl-js/fiwl-js?style=for-the-badge"
      alt="Repository Stars"
    >
</a>
<a href="https://github.com/fiwl-js/fiwl-js/network/members">
<img
      src="https://img.shields.io/github/forks/fiwl-js/fiwl-js?style=for-the-badge"
      alt="Repository Forks"
    >
</a>
<a href="https://github.com/fiwl-js/fiwl-js/issues">
<img
      src="https://img.shields.io/github/issues/fiwl-js/fiwl-js?style=for-the-badge" 
      alt="View Issues"
    >
</a>
<a href="https://github.com/fiwl-js/fiwl-js/blob/master/LICENSE">
<img
      src="https://img.shields.io/github/license/fiwl-js/fiwl-js?style=for-the-badge"
      alt="MIT License"
    >
</a>
  
<a href="https://fiwl-js.github.io/docs/">
<img
      src="https://img.shields.io/badge/Documentation-Docasaurus-blue?style=for-the-badge"
      alt="View Documentation"
    >
</a>

<a href="https://prettier.io/">
<img
      src="https://img.shields.io/badge/code_style-prettier-ff47bc.svg?style=for-the-badge" 
      alt="Code styled with Prettier"
    >
</a>

<a href="https://discord.gg/X5x5zdvuaj">
<img
      src="https://img.shields.io/badge/chat-on%20discord-7289da.svg?style=for-the-badge" 
      alt="FIWL Discord Server"
    >
</a>

<a href="https://ko-fi.com/fiwl_js">
<img
      src="https://img.shields.io/badge/Support%20Us%20%F0%9F%92%96-Ko--Fi-red?style=for-the-badge" 
      alt="Support us on Ko-Fi!"
    >
</a>

</p>

<hr>

## Installation

Quickstart boilerplate is already provided on a github repository. To use that, please follow these steps:

#### Prepare your bash environment

MacOS and Linux users can continue to the next step. If you are Windows user, using WSL is highly recommended because Command Prompt and Powershell are quite different. Thus, potential problem is high on future development. There is an official WSL installation tutorial to follow. For Windows 8.1 or older, use cygwin instead.

#### Clone via git

For installing quickstart boilerplate, just clone via git with this command:
git clone https://github.com/Thor-x86/fiwl-quickstart

#### Start your favorite IDE

Now you can choose fiwl-quickstart as project directory for your IDE. If you are using VSCode, enter this command:
`code ./fiwl-quickstart`

The **fiwl.js** script emulates FIWL environment for HTML5 standard.

See [documentation](https://fiwl-js.github.io/docs/) for further information.

## Usage

When developing web app with FIWL, we need to maintain these 3 files:

`main.fiwl` :
Your app's first entrance. Another stages (or pages in HTML term) will be represented by \*.fiwl.

`style.varl` :
Change default appearance of widgets. It's optional, but really useful if you have to keep text size and color in tone.

`manifest.json` :
Inform overall app information. Including app name, app description, metadata for SEO, custom first entrance, custom resource directory, and more.

To understand `main.fiwl`, go [here](https://fiwl-js.github.io/docs/intro/how_to_use#understanding-mainfiwl).

## Running the App

To run the app, we need to simulate web server. You could use any web server including node http-server, apache, and nginx. For now, let's use the easiest way (node http-server).

#### Make sure you are currently at correct directory

If you follow from beginning, you are now at fiwl-quickstart directory and safe to jump to the next step. Otherwise, locate to the cloned repository directory using "cd" command.

#### Install required programs

Enter commands below on bash terminal:

```bash
sudo apt update
sudo apt install npm
sudo npm install -g http-server
```

#### Start http-server

You have to run command as below everytime you resume developing FIWL app:

```bash
http-server . -p 8080
```

To stop http-server, hit CTRL+C while on terminal. Run command above to start http-server again.

#### Open your browser

When the http-server is ready, enter link below to your browser's URL box:

```bash
http://localhost:8080/
```

## Contributors

![](CONTRIBUTORS.svg)

## Love FIWL?

A donation is very much appreciated and helpful for our growth.

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/K3K32SUK2)

---

_README file created by [Brayden W](https://braydentw.github.io)_
