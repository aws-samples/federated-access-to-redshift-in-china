# Federated Access to Amazon Redshift in China with Active Directory

## Introduction
Many customers already manage user identities through identity providers (IdPs) for single sign-on access. With an IdP such as Active Directory Federation Services (AD FS), you can set up federated access to [Amazon Redshift](https://www.amazonaws.cn/en/redshift/) clusters as a mechanism to control permissions for the database objects by business groups. This provides a seamless user experience, and centralizes the governance of authentication and permissions for end-users. For more information, refer to the blog post series “Federate access to your Amazon Redshift cluster with Active Directory Federation Services (AD FS)” ([part 1](https://aws.amazon.com/blogs/big-data/federate-access-to-your-amazon-redshift-cluster-with-active-directory-federation-services-ad-fs-part-1/), [part 2](https://aws.amazon.com/blogs/big-data/federate-access-to-your-amazon-redshift-cluster-with-active-directory-federation-services-ad-fs-part-2/)).

Due to the differences in the implementation of [Amazon Web Services in China](https://docs.amazonaws.cn/en_us/aws/latest/userguide/introduction.html), customers have to adjust the configurations accordingly. For example, AWS China Regions (Beijing and Ningxia) are in a separate [AWS partition](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html#arns-syntax), therefore all the Amazon Resource Names (ARNs) include the suffix -cn. AWS China Regions are also hosted at a different domain: [www.amazonaws.cn](http://www.amazonaws.cn/).

This post introduces a step-by-step procedure to set up federated access to Amazon Redshift in China Regions. It pinpoints the key differences you should pay attention to and provides a troubleshooting guide for common errors.

## AWS Blog
A post is [published in the AWS Big Data Blog channel](https://aws.amazon.com/blogs/big-data/federated-access-to-amazon-redshift-clusters-in-aws-china-regions-with-active-directory-federation-services/) to introduce the solution in detail.

## Deployment and Cleanup
Save your FederationMetadata.xml file at `/tmp/FederationMetadata.xml`.

AWS CDK 2 is used as the infrastructure as code solution.
If this is the first time you run CDK to deploy the stack, initialize the environment:
```bash
export AWS_ACCOUNT=
export AWS_DEFAULT_REGION=cn-north-1
export AWS_PROFILE=

cd redshift-cn/cdk

# install aws-cdk cli if not yet installed
npm install -g aws-cdk

# install dependencies
npm install

# deploy CDK toolkit stack
cdk bootstrap
```

For subsequent deployments and updates, run:
```bash
export AWS_ACCOUNT=
export AWS_DEFAULT_REGION=cn-north-1
export AWS_PROFILE=

cd redshift-cn/cdk
cdk deploy redshift-cn --require-approval never
```

To destroy, run:
```bash
export AWS_ACCOUNT=
export AWS_DEFAULT_REGION=cn-north-1
export AWS_PROFILE=

cd redshift-cn/cdk
cdk destroy redshift-cn --force
```

## AD FS Management
Create the AD groups and users in the AD FS.
Replace `yourcompany.com` with the correct domain name and choose a strong password for the users.
```
dsadd user "cn=clement,cn=users,dc=yourcompany,dc=com" ^
-samid clement -disabled no -pwd "YourOwnStrongPassword" ^
-upn   clement@yourcompany.com ^
-email clement@yourcompany.com

dsadd user "cn=jimmy,cn=users,dc=yourcompany,dc=com" ^
-samid jimmy -disabled no -pwd "YourOwnStrongPassword" ^
-upn   jimmy@yourcompany.com ^
-email jimmy@yourcompany.com

dsadd group "cn=role_data_scientist,cn=users,dc=yourcompany,dc=com"
dsadd group "cn=role_data_engineer,cn=users,dc=yourcompany,dc=com"
dsadd group "cn=group_oncology,cn=users,dc=yourcompany,dc=com"
dsadd group "cn=group_pharmacy,cn=users,dc=yourcompany,dc=com"

dsmod group "cn=role_data_scientist,cn=users,dc=yourcompany,dc=com" ^
-addmbr "cn=clement,cn=users,dc=yourcompany,dc=com"

dsmod group "cn=role_data_engineer,cn=users,dc=yourcompany,dc=com"  ^
-addmbr "cn=jimmy,cn=users,dc=yourcompany,dc=com"

dsmod group "cn=group_oncology,cn=users,dc=yourcompany,dc=com" ^
-addmbr "cn=clement,cn=users,dc=yourcompany,dc=com"

dsmod group "cn=group_oncology,cn=users,dc=yourcompany,dc=com" ^
-addmbr "cn=jimmy,cn=users,dc=yourcompany,dc=com"

dsmod group "cn=group_pharmacy,cn=users,dc=yourcompany,dc=com" ^
-addmbr "cn=clement,cn=users,dc=yourcompany,dc=com"
```

Remove the AD users and groups created in the AD FS. Replace `yourcompany.com` with the correct domain name.
```
dsrm "cn=clement,cn=users,dc=yourcompany,dc=com" -noprompt
dsrm "cn=jimmy,cn=users,dc=yourcompany,dc=com"   -noprompt

dsrm "cn=role_data_scientist,cn=users,dc=yourcompany,dc=com" -noprompt
dsrm "cn=role_data_engineer,cn=users,dc=yourcompany,dc=com"  -noprompt

dsrm "cn=group_oncology,cn=users,dc=yourcompany,dc=com" -noprompt
dsrm "cn=group_pharmacy,cn=users,dc=yourcompany,dc=com" -noprompt
```

## Security
See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License
This library is licensed under the MIT-0 License. See the LICENSE file.
