docker run -d --privileged -v /dev/bus/usb:/dev/bus/usb -v /root/images:/var/images -p 4048:4048 --name motion-server --restart=always motion-server
