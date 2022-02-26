// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const path = require('path');
const cdk = require('aws-cdk-lib');
const iam = require('aws-cdk-lib/aws-iam');
const { RedshiftStack } = require(path.join(__dirname, 'redshift-stack'));
const { Constants } = require(path.join(__dirname, 'constants'));

class RedshiftRoleStack extends cdk.NestedStack {
    constructor(scope, iamStack, redshiftStack) {
        super(scope, "redshift-role");

        const condition = { StringEquals: { "SAML:aud": "https://signin.amazonaws.cn/saml" } };
        const roleGroups = {
            "data_scientist": ["oncology", "pharmacy"],
            "data_engineer": ["pharmacy"],
        }
        for (const role in roleGroups) {
            this.createRole(iamStack.provider, condition, role, roleGroups[role], redshiftStack.cluster);
        }
    }

    createRole(provider, condition, role, groups, cluster) {
        this.addPoliciesToRole(new iam.Role(this, `role-${role}`, {
            roleName: `${Constants.PREFIX_ROLE}${role}`,
            assumedBy: new iam.SamlPrincipal(provider, condition)
        }), groups, cluster);
    }

    addPoliciesToRole(role, groups, cluster) {
        const condition = { StringEquals: { "aws:userid": `${role.roleId}:\${redshift:DbUser}` } };
        role.addToPolicy(new iam.PolicyStatement({
            actions: ["redshift:DescribeClusters"],
            resources: [this.formatArn({
                arnFormat: cdk.ArnFormat.COLON_RESOURCE_NAME,
                service: "redshift",
                resource: "cluster",
                resourceName: cluster.clusterName
            })],
        }));
        role.addToPolicy(new iam.PolicyStatement({
            actions: ["redshift:GetClusterCredentials"],
            conditions: condition,
            resources: [
                this.formatArn({
                    arnFormat: cdk.ArnFormat.COLON_RESOURCE_NAME,
                    service: "redshift",
                    resource: "dbuser",
                    resourceName: `${cluster.clusterName}/\${redshift:DbUser}`
                }),
                this.formatArn({
                    arnFormat: cdk.ArnFormat.COLON_RESOURCE_NAME,
                    service: "redshift",
                    resource: "dbname",
                    resourceName: `${cluster.clusterName}/${RedshiftStack.DB_NAME}`
                })
            ],
        }));
        role.addToPolicy(new iam.PolicyStatement({
            actions: ["redshift:CreateClusterUser"],
            conditions: condition,
            resources: [this.formatArn({
                arnFormat: cdk.ArnFormat.COLON_RESOURCE_NAME,
                service: "redshift",
                resource: "dbuser",
                resourceName: `${cluster.clusterName}/\${redshift:DbUser}`
            })],
            conditions: condition
        }));
        role.addToPolicy(new iam.PolicyStatement({
            actions: ["redshift:JoinGroup"],
            conditions: condition,
            resources: groups.map(group => this.formatArn({
                arnFormat: cdk.ArnFormat.COLON_RESOURCE_NAME,
                service: "redshift",
                resource: "dbgroup",
                resourceName: `${cluster.clusterName}/${Constants.PREFIX_GROUP}${group}`
            })),
        }));
    }
}

module.exports = { RedshiftRoleStack }
