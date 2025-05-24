#!/usr/bin/env python

import os
import sys
import yaml
import time
import random
from datetime import datetime
from scholarly import scholarly


def load_scholar_user_id():
    config_file = "_data/socials.yml"
    if not os.path.exists(config_file):
        sys.exit(f"Configuration file {config_file} not found.")
    with open(config_file, "r") as f:
        try:
            config = yaml.safe_load(f)
            scholar_user_id = config.get("scholar_userid")
            if not scholar_user_id:
                sys.exit("No 'scholar_userid' found in the configuration file.")
            return scholar_user_id
        except yaml.YAMLError as e:
            sys.exit(f"Error parsing YAML file {config_file}: {e}")


SCHOLAR_USER_ID = load_scholar_user_id()
OUTPUT_FILE = "_data/citations.yml"


def get_scholar_citations() -> None:
    print(f"Fetching citations for Google Scholar ID: {SCHOLAR_USER_ID}")
    today = datetime.now().strftime("%Y-%m-%d")

    # Check whether the output file already checked citations today .. if so, skip fetching
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, "r") as f:
                data = yaml.safe_load(f)
                if data and "metadata" in data and "last_updated" in data["metadata"]:
                    print(f"Last updated on: {data['metadata']['last_updated']}")
                    if data["metadata"]["last_updated"] == today:
                        print("Citations data is already up-to-date. Skipping fetch.")
                        return
        except Exception as e:
            print(f"Warning: Could not read existing citation data: {e}")

    citation_data = {"metadata": {"last_updated": today}, "papers": {}}

    scholarly.set_timeout(15)
    scholarly.set_retries(3)
    author = scholarly.search_author_id(SCHOLAR_USER_ID)
    author_data = scholarly.fill(author)

    if not author_data:
        print("Could not fetch author data")
        sys.exit(1)

    if "publications" not in author_data:
        print("No publications found in author data")
        sys.exit(1)

    for pub in author_data["publications"]:
        try:
            pub_id = None
            if "pub_id" in pub and pub["pub_id"]:
                pub_id = pub["pub_id"]
            elif "author_pub_id" in pub and pub["author_pub_id"]:
                pub_id = pub["author_pub_id"]

            if not pub_id:
                print(
                    f"Warning: No ID found for publication: {pub.get('bib', {}).get('title', 'Unknown')}"
                )
                continue

            title = "Unknown Title"
            year = "Unknown Year"
            citations = 0

            if "bib" in pub:
                if "title" in pub["bib"]:
                    title = pub["bib"]["title"]
                if "pub_year" in pub["bib"]:
                    year = pub["bib"]["pub_year"]

            if "num_citations" in pub:
                citations = pub["num_citations"]

            print(f"Found: {title} ({year}) - Citations: {citations}")

            # Store citation data
            citation_data["papers"][pub_id] = {
                "title": title,
                "year": year,
                "citations": citations,
            }

        except Exception as e:
            print(f"Error processing publication: {e}")

    with open(OUTPUT_FILE, "w") as f:
        yaml.dump(citation_data, f, width=1000, sort_keys=False)
    print(f"Citation data saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    get_scholar_citations()
