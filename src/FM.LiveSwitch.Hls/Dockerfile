FROM mcr.microsoft.com/dotnet/sdk:5.0
WORKDIR /code
ENV NODE_ENV=production


# install NodeJS 13.x
# see https://github.com/nodesource/distributions/blob/master/README.md#deb
RUN apt-get update -yq 
RUN apt-get install curl gnupg -yq 
RUN curl -sL https://deb.nodesource.com/setup_13.x | bash -
RUN apt-get install -y nodejs

RUN apt-get install -y ffmpeg wget unzip 
RUN wget https://github.com/liveswitch/liveswitch-connect/releases/download/v0.3.0/linux-x64.zip
RUN unzip linux-x64.zip

EXPOSE 3001
COPY . .
RUN chmod +rx lsconnect
RUN ln -s /code/lsconnect /usr/bin/lsconnect
CMD npm start