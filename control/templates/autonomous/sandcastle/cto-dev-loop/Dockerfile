FROM node:22-bookworm

# Install system dependencies
# [PROJECT: add project-specific packages here]
RUN apt-get update && apt-get install -y \
  git \
  curl \
  jq \
  python3 python3-pip python3-venv \
  && rm -rf /var/lib/apt/lists/*

# Build-args for UID/GID alignment — ensures file ownership matches host
ARG AGENT_UID=1000
ARG AGENT_GID=1000

# Rename the base image's "node" user to "agent" and align UID/GID.
# This prevents permission issues with git worktree mounts.
RUN groupmod -o -g $AGENT_GID node && usermod -o -u $AGENT_UID -g $AGENT_GID -d /home/agent -m -l agent node
USER ${AGENT_UID}:${AGENT_GID}

# Install Claude Code CLI
RUN curl -fsSL https://claude.ai/install.sh | bash

# Add Claude to PATH
ENV PATH="/home/agent/.local/bin:$PATH"

WORKDIR /home/agent

ENTRYPOINT ["sleep", "infinity"]
