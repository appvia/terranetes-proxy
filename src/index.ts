import YAML from "yaml";

import { convertFiles } from "@cdktf/hcl2json";

export async function parsetf(path: string) {
  const json = await convertFiles(path);
  return json;
}

export function formatVariables(variables: any) {
  return Object.fromEntries(
    Object.entries(variables.variable).map(([k, v]) => {
      //@ts-ignore
      return [k, v[0].description];
    })
  );
}
export function makeValuesYaml(variables: any) {
  const doc = new YAML.Document({});
  for (const [key, value] of Object.entries(variables)) {
    const k = doc.createNode(key);
    k.commentBefore = ` ${value}`;
    k.spaceBefore = true;
    const v = doc.createNode(null);
    const map = new YAML.Pair(k, v);
    doc.add(map);
  }
  return doc.toString();
}

// TODO:
// export function makeResourceJson(variables: any) {
//   const doc = {
//     apiVersion: "tf.isaaguilar.com/v1alpha1",
//     kind: "Terraform",
//     metadata: {
//       name: "{{ .Chart.Name }}",
//       labels: {
//         // '{{- include "aws-ec2-security-group.labels" . | nindent 4 }}': "a",
//       },
//     },
//     spec: {
//       terraformVersion: "{{ .Values.terraform.version }}",
//       terraformRunnerPullPolicy: "IfNotPresent",
//       terraformModule:
//         "{{ .Values.terraform.module }}?ref={{ .Values.terraform.moduleVersion }}",
//       resourceDownloads: [
//         {
//           address:
//             "https://github.com/appvia/terraform-providers.git/aws/aws.tf?ref=main",
//         },
//       ],
//       ignoreDelete: false,
//       // "{{- with .Values.aws.credentials }}"
//       // "credentials":
//       //   "{{- toYaml . | nindent 2 }}"
//       // "{{- end }}"
//       env: [
//         {
//           name: "TF_VAR_region",
//           value:
//             '{{ required "You must specify an AWS region!" .Values.aws.region }}',
//         },
//       ],
//       outputsSecret: "{{ .Chart.Name }}-outputs",
//       customBackend: `
//         terraform {
//           backend "kubernetes" {
//             secret_suffix    = "{{ .Chart.Name }}"
//             in_cluster_config  = true
//             namespace = "{{ .Release.Namespace }}"
//           }
//         }`,
//     },
//   };
//   return doc;
// }

export function makeResourceYaml(variables: any) {
  const doc = `
  apiVersion: tf.isaaguilar.com/v1alpha1
  kind: Terraform
  metadata:
    name: {{ .Chart.Name }}
  spec:
    terraformVersion: {{ .Values.terraform.version }}
    terraformRunnerPullPolicy: IfNotPresent
    terraformModule: {{ .Values.terraform.module }}?ref={{ .Values.terraform.moduleVersion }}
    resourceDownloads:
    - address: https://github.com/appvia/terraform-providers.git/aws/aws.tf?ref=main
    ignoreDelete: false
    {{- with .Values.aws.credentials }}
    credentials:
      {{- toYaml . | nindent 2 }}
    {{- end }}
    env:
    #TODO: map .Values to TF_VAR_$valuename = $value
    - name: TF_VAR_region
      value: {{ required "You must specify an AWS region!" .Values.aws.region }}
    - name: TF_VAR_name
      value: {{ required "You must specify a EC2-VPC security group name!" .Values.ec2.sg_name }}
    - name: TF_VAR_vpc_id
      value: {{ required "You must specify a VPC ID!" .Values.ec2.vpc_id }}
    outputsSecret: "{{ .Chart.Name }}-outputs"
    customBackend: |-
      terraform {
        backend "kubernetes" {
          secret_suffix    = "{{ .Chart.Name }}"
          in_cluster_config  = true
          namespace = "{{ .Release.Namespace }}"
        }
      }
  `;
  return doc;
}
