> `install-gbox` is an image that provides an environment to drop gbox images on the GranatumX database.



### Prerequisites

You mainly need a working copy of [Docker](http://docker.com). It is used
exclusively to manage system configurations for running numerous tools
across numerous platforms.

### Installation

* All docker images are at "https://hub.docker.com/u/granatumx".
* All github repos are at "https://github.com/granatumx/*".

First set up your scripts and aliases to make things easier. This command should pull the container if
it does not exist locally which facilitates installing on a server.

```
source <( docker run --rm -it granatumx/scripts:1.0.0 gx.sh )
```

This command makes `gx` available. You can simply run `gx` to obtain a list of scripts available.

The GranatumX database should be running to install gboxes. The gbox sources do not need to be installed.
A gbox has a gbox.tgz compressed tar file in the root directory which the installer copies out and uses
to deposit the preferences on the database. Since these gboxes are in fact docker images, they will be
pulled if they do not exist locally on the system. Convenience scripts are provided for installing specific gboxes.


```
$ gx run.sh                     # Will start the database, taskrunner, and webapp
$ gx installStandardGboxes.sh   # Install standard gboxes (install specific ones with installGbox.sh)

# Now you should be able to navigate to http://localhost:34567 and see GranatumX running.
# If you add a step, you should see the installed gboxes available.
```

### Notes

The build is a two-stage process. First the development environment is built which runs `pkg` to create
an executable. In the second part of the process, the run environment is created that holds just the
executable and some schemas (no need for the 600MB+ of dependencies installed).

