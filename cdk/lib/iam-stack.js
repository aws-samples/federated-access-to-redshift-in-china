// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const path = require('path');
const cdk = require('aws-cdk-lib');
const iam = require('aws-cdk-lib/aws-iam');
const { Constants } = require(path.join(__dirname, 'constants'));

class IamStack extends cdk.NestedStack {
  provider;

  constructor(scope) {
    super(scope, "iam");
    this.provider = this.createProvider();
  }

  createProvider() {
    return new iam.SamlProvider(this, "saml-provider", {
      name: Constants.SAML_PROVIDER_NAME,
      metadataDocument: iam.SamlMetadataDocument.fromFile(Constants.SAML_METADATA_XML_FILE)
    });
  }
}

module.exports = { IamStack }
