// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

class Constants {
    static VPC_CIDR = "10.0.0.0/16";
    static SECURITY_GROUP_NAME = "rc-default-security-group";

    static SAML_PROVIDER_NAME = "rc-provider";
    static SAML_METADATA_XML_FILE = "/tmp/FederationMetadata.xml";

    static REDSHIFT_SERVICE_ROLE = "rc-redshift-service-role";
    static REDSHIFT_CLUSTER_NAME = "rc-redshift-cluster";

    static REDSHIFT_DATABASE_NAME = "main";
    static REDSHIFT_USER_NAME = "admin";

    static PREFIX_ROLE = "rc_";
    static PREFIX_GROUP = "group_";
}

module.exports = { Constants }
