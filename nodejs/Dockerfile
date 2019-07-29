FROM ubuntu:16.04

RUN set -x \
    && apt-get update \
    && apt-get install -y locales language-pack-ja libreoffice-l10n-ja libreoffice imagemagick ghostscript nkf curl fonts-ipa* fonts-takao* \
    && curl -sL https://deb.nodesource.com/setup_10.x | bash - \
    && apt-get install -y nodejs build-essential git vim libcurl3 \
    && mkdir /webapp

COPY policy.xml /etc/ImageMagick-6/policy.xml

WORKDIR /webapp

CMD ["node"]
