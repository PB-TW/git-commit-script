#!/bin/bash
IFS=","
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" || exit ; pwd -P )
contributorsFile=$"${parent_path}/contributors.csv"
storyPrefix="BCS"

print_contributors () {
  echo "The contributors to this repository:"
  while read -r -a line; do
    echo "${line[0]} (${line[1]})"
  done < "$contributorsFile"
}

read_story_number () {
  read -r -p "Story number: ${storyPrefix}-" story
  echo "${storyPrefix}-${story}";
}

read_pairs () {
  read -r -p "Comma-separated, leave empty for solo (e.g. 'es,gt' or 'pb' or ''); List the contributors to the story except for yourself: " -a pairsArray

  pairs=""
  for pair in "${pairsArray[@]}"
  do
    while read -r -a line; do
      if [ "${line[0]}" == "$pair" ]; then
        pairs+="Co-authored by: ${line[1]} <${line[2]}>"$'\n'
      fi
    done < "$contributorsFile"
  done
  echo "${pairs}"
}

read_short_desc () {
  read -r -p "Commit short description: " desc
  echo "${desc}";
}

read_long_desc () {
  read -r -p "Further description (optional): " longDesc
  echo "${desc}";
}

### Print contributors
print_contributors

### Read commit message
echo ""
story=$(read_story_number)
echo ""
pairs=$(read_pairs)
echo ""
desc=$(read_short_desc)
echo ""
longDesc=$(read_long_desc)

### Commit
git commit -m "[$story] $desc" -m "$longDesc" -m "$pairs"