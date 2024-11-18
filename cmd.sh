#!/usr/bin/env bash

function main {

    case $1 in

    "init")
        docker compose build
        docker compose up -d
        # docker exec -it jumpbox bash
        ;;
    "destroy")
        docker compose down
        if [ -d src/node_modules ]; then
            echo "Removing node_modules"
            rm -r src/node_modules
        fi
        if [ -d ~/docker/postgres/subtubes-postgres ]; then
            echo "Removing docker container data..."
            rm -r ~/docker/postgres/subtubes-postgres
        fi
        ;;
    *)
        echo "Unrecognized command $1"
        ;;
    esac
}

main "$@"
