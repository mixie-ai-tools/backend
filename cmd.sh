#!/usr/bin/env bash

function main {

    case $1 in

    "init")
        docker compose build
        docker compose up -d
        # docker exec -it jumpbox bash
        lms load llama-3.2-1b-instruct --identifier llm-model 
        lms load  nomic-ai/nomic-embed-text-v1.5-GGUF/nomic-embed-text-v1.5.Q4_K_M.gguf --identifier embed-model 
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
