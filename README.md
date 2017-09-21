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
        GEMFURY_USERNAME: <username value>
      encrypted_environment:
        # GEMFURY_API_TOKEN
        - <encrypted "GEMFURY_API_TOKEN=<token value>", see below>
      volumes:
        - ./:/repo/

*Note:* to create the encrypted_environment value for `GEMFURY_API_TOKEN` on the Mac the following ca be helpful:

    printf '%s' "GEMFURY_API_TOKEN=$(pbpaste)" > raw.tmp && jet encrypt raw.tmp crypt.tmp && cat crypt.tmp | pbcopy && rm raw.tmp crypt.tmp

Copy that onto the command line, then copy the value of GEMFURY_API_TOKEN into your clipboard. Press enter. The command above will use the value in your clipboard, encrypt it, and then copy it back into your clipboard, now encrypted. You can now paste the encrypted value into your `codeship-services.yml` file.

In `codeship-steps.yml` it can be used as a step similar to the following:

    - name: deploy
      tag: master
      service: gemfury-deploy
      command: node deploy.js
