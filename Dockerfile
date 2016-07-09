FROM node:0.10.41

RUN apt-get update && apt-get install -y cmake libusb-1.0-0-dev freeglut3-dev libxmu-dev libxi-dev libopencv-dev

RUN git clone https://github.com/OpenKinect/libfreenect
WORKDIR libfreenect
RUN mkdir build
WORKDIR build
RUN cmake -L ..
RUN make
RUN make install

RUN touch usr-local-libs.conf
RUN echo "/usr/local/lib64" >> usr-local-libs.conf
RUN echo "/usr/local/lib" >> usr-local-libs.conf
RUN mv usr-local-libs.conf /etc/ld.so.conf.d/usr-local-libs.conf
RUN ldconfig -v

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app

CMD [ "node", "motion-server.js" ]
