// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const path = require('path');
const cdk = require('aws-cdk-lib');
const ec2 = require('aws-cdk-lib/aws-ec2');
const { Constants } = require(path.join(__dirname, 'constants'));

class VpcStack extends cdk.NestedStack {
    vpc;
    securityGroup;

    constructor(scope) {
        super(scope, "vpc");

        this.vpc = this.createVpc();
        this.securityGroup = this.createSecurityGroup();
    }

    createVpc() {
        return new ec2.Vpc(this, 'vpc', {
            cidr: Constants.VPC_CIDR,
            maxAzs: 2,
            enableDnsHostnames: true,
            enableDnsSupport: true,
            subnetConfiguration: [{
                cidrMask: 24,
                name: 'public',
                subnetType: ec2.SubnetType.PUBLIC // use PRIVATE for production
            }]
        });
    }

    createSecurityGroup() {
        const group = new ec2.SecurityGroup(this, "security-group", {
            securityGroupName: Constants.SECURITY_GROUP_NAME,
            vpc: this.vpc,
            allowAllOutbound: true
        });
        cdk.Tags.of(group).add("Name", "Default Security Group");
        return group;
    }
}

module.exports = { VpcStack }
