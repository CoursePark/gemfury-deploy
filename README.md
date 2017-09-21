# Gemfury Deploy

Publish a npm module to Gemfury.

## Environment Variables

### GEMFURY_USERNAME

The Gemfury username to use to publish

    GEMFURY_USERNAME=yyyyyyy

### GEMFURY_API_TOKEN

The API token specified on the Settings page for your account in Gemfury (https://manage.fury.io/manage/<GEMFURY_USERNAME>/settings).

    GEMFURY_API_TOKEN=xxxxxxxxxxxxxxxxxxxx

## Docker Usage

The following docker command will publish to Gemfury the module of the current directory. The current directory should have a package.json file that defines the module to be published.

    docker run --rm -it \
      -v $(pwd):/repo \
      -e GEMFURY_API_TOKEN=xxxxxxxxxxxxxxxxxxxx \
      -e GEMFURY_USERNAME=yyyyyyy \
      bluedrop360/gemfury-deploy

## Codeship Usage:

In `codeship-services.yml` create a service similar to the following:

    gemfury-deploy:
      image: bluedrop360/gemfury-deploy
      cached: true
      environment:
        GEMFURY_USERNAME: <username>
      encrypted_env:
        - <encrypted GEMFURY_API_TOKEN>
      volumes:
        - ./:/repo

Mac Instructions for encrypting the base64 encoded environment variables for secure use in `codeship-services.yml` or `codeship-steps.yml`:
      
- copy the value of the `GEMFURY_API_TOKEN` environment variable
- use this command line to convert it into an encrypted value

      echo "GEMFURY_API_TOKEN=$(pbpaste)" > raw.tmp && jet encrypt raw.tmp crypt.tmp && cat crypt.tmp | pbcopy && rm raw.tmp crypt.tmp

- the values above that have been copied to the clipboard can now be pasted as array items on `encrypted_environment` in either `codeship-services.yml` or `codeship-steps.yml`.
