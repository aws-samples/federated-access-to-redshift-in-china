#!/usr/bin/env node

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const path = require('path');
const cdk = require('aws-cdk-lib');
const { IamStack } = require(path.join(__dirname, '../lib/iam-stack'));
const { VpcStack } = require(path.join(__dirname, '../lib/vpc-stack'));
const { RedshiftStack } = require(path.join(__dirname, '../lib/redshift-stack'));
const { RedshiftRoleStack } = require(path.join(__dirname, '../lib/redshift-role-stack'));

class RcStack extends cdk.Stack {
    constructor(scope) {
        super(scope, "redshift-cn");
        const iamStack = new IamStack(this);
        const vpcStack = new VpcStack(this);
        const redshiftStack = new RedshiftStack(this, vpcStack);
        new RedshiftRoleStack(this, iamStack, redshiftStack);
    }
}
new RcStack(new cdk.App());
