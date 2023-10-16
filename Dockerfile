FROM ubuntu:latest

RUN apt-get update && \
    apt-get install -yq tzdata && \
    ln -fs /usr/share/zoneinfo/America/California /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata

ENV TZ="America/California"

RUN apt-get update \
    &&  apt-get upgrade -y \
    &&  apt-get install -y \
    python3  python3-pip python3-dev \
    make cmake gcc g++ gfortran ca-certificates nginx \
    &&  apt-get clean \
    &&  rm -rf /var/cache/apt/archives/* /var/lib/apt/lists/*

WORKDIR /rnai_root
COPY rnai_backend/. .

RUN pip3 install --upgrade pip
RUN pip3 install setuptools_rust
RUN pip3 install -r requirements.txt

EXPOSE 80

RUN chmod +x ./start.sh
ENTRYPOINT ["./start.sh"]