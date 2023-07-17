# terraform-github-action@master

This action makes google cloud resources based on your terraform configuration files.

You simply have to provide the path for where your terraform configuration files are located relative to the root of your remote repository.

## Prerequisites
- Must be authenticated to Google using WIF and generate OAuth 2.0 access token utilizing `google-github-actions/auth` action.

## Usage

```yaml
jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: "Cloning repo"
        uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - id: 'auth'
        name: 'Authenticate to Google Cloud'
        uses: 'google-github-actions/auth@v1'
        with:
          credentials_json: ${{ secrets.OFF_NET  }}

      - name: 'Set up Cloud SDK'
        uses: 'google-github-actions/setup-gcloud@v1'

      - name: "Test the terraform-github-action"
        uses: TeamDevEx/terraform-github-action@master
        with:
          terraform_dir_path: 'terraform'
          to_destroy: false
```
## Inputs

- `terraform_dir_path` - Directory of the terraform configuration files {required}
- `to_destroy` - Type true to destroy already made resources
