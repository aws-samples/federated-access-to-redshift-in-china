// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const path = require('path');
const cdk = require('aws-cdk-lib');
const iam = require('aws-cdk-lib/aws-iam');
const ec2 = require('aws-cdk-lib/aws-ec2');
const redshift = require('@aws-cdk/aws-redshift-alpha');
const { Constants } = require(path.join(__dirname, 'constants'));

class RedshiftStack extends cdk.NestedStack {
  cluster;
  role;

  constructor(scope, vpcStack) {
    super(scope, "redshift");
    const subnetGroup = this.createSubnetGroup(vpcStack.vpc, ec2.SubnetType.PUBLIC); // use PRIVATE for production
    this.role = this.createRole();
    this.cluster = this.createCluster(vpcStack, subnetGroup);
  }

  createRole() {
    return new iam.Role(this, "service-role", {
      roleName: Constants.REDSHIFT_SERVICE_ROLE,
      assumedBy: new iam.ServicePrincipal("redshift.amazonaws.com")
    });
  }

  createSubnetGroup(vpc, subnetType) {
    return new redshift.ClusterSubnetGroup(this, subnetType + "-subnet-group", {
      vpc: vpc,
      description: subnetType + " subnet group",
      vpcSubnets: { subnetType: subnetType },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }

  createCluster(vpcStack, subnetGroup) {
    return new redshift.Cluster(this, "cluster", {
      clusterName: Constants.REDSHIFT_CLUSTER_NAME,
      masterUser: { masterUsername: Constants.REDSHIFT_USER_NAME },
      vpc: vpcStack.vpc,
      publiclyAccessible: true, // set to false for production
      encrypted: false, // set to true for production and specify a customer KMS key
      numberOfNodes: 1,
      clusterType: redshift.ClusterType.SINGLE_NODE,
      nodeType: redshift.NodeType.DC2_LARGE,
      defaultDatabaseName: Constants.REDSHIFT_DATABASE_NAME,
      securityGroups: [vpcStack.securityGroup],
      roles: [this.role],
      subnetGroup: subnetGroup,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC }, // use private subnets for production
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })
  }
}

module.exports = { RedshiftStack }
