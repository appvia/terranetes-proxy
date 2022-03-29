import * as mod from "../index";
// import * as gatekeeper from "../gatekeeper"
// import * as kyverno from "../kyverno"
// import * as kubewarden from "../kubewarden"
import * as fs from "fs";

// const fixturePSPYAML = `
// apiVersion: policy/v1beta1
// kind: PodSecurityPolicy
// metadata:
//   name: policy
// spec:
//   runAsUser:
//     rule: RunAsAny
//   seLinux:
//     rule: RunAsAny
//   fsGroup:
//     rule: RunAsAny
//   supplementalGroups:
//     rule: 'RunAsAny'
//   volumes:
//     - '*'
// `
// const fixturePSPJSON = `{ "apiVersion": "policy/v1beta1", "kind": "PodSecurityPolicy", "metadata": { "name": "policy" }, "spec": { "runAsUser": { "rule": "RunAsAny" }, "seLinux": { "rule": "RunAsAny" }, "fsGroup": { "rule": "RunAsAny" }, "supplementalGroups": { "rule": "RunAsAny" }, "volumes": ["*"] } }`
// const fixturePSPObject = {
//   apiVersion: "policy/v1beta1",
//   kind: "PodSecurityPolicy",
//   metadata: { name: "policy" },
//   spec: {
//     runAsUser: { rule: "RunAsAny" },
//     seLinux: { rule: "RunAsAny" },
//     fsGroup: { rule: "RunAsAny" },
//     supplementalGroups: { rule: "RunAsAny" },
//     volumes: ["*"],
//   },
// }

// describe("parse", () => {
//   it("should parse a yaml object", () =>
//     expect(mod.parse(fixturePSPYAML)).toMatchSnapshot())

//   it("should parse a json object", () =>
//     expect(mod.parse(fixturePSPJSON)).toMatchSnapshot())
// })

// describe("transform", () => {
//   it("should call the right engine", () => {
//     const spy = jest.spyOn(gatekeeper, "transform_gatekeeper")
//     mod.transform(fixturePSPObject, "gatekeeper")
//     expect(spy).toHaveBeenCalled()
//   })
// })

// function help_load_psp(fixture: string) {
//   const yaml = fs.readFileSync(`tests/${fixture}/psp.yaml`, { flag: "r" })
//   return mod.parse(yaml.toString())
// }

// const pspFields = [
//   "allowPrivilegeEscalation",
//   "allowedCapabilities",
//   "allowedFlexVolumes",
//   "allowedHostPaths",
//   "allowedProcMountTypes",
//   "allowedUnsafeSysctls",
//   "apparmor",
//   "defaultAddCapabilities",
//   "defaultAllowPrivilegeEscalation",
//   "forbiddenSysctls",
//   "fsgroup",
//   "hostIPC",
//   "hostNetwork",
//   "hostPID",
//   "hostPorts",
//   "privileged",
//   "readOnlyRootFilesystem",
//   "requiredDropCapabilities",
//   "runAsGroup",
//   "runAsUser",
//   "seLinux",
//   "seccomp",
//   "supplementalGroups",
//   "volumes",
// ].map((field) => [field])

// describe('transform_gatekeeper', () => {
//   it('should do an empty PSP', () => expect(gatekeeper.transform_gatekeeper(fixturePSPObject)).toStrictEqual([]))
//   test.each(pspFields)('%s', (field) =>
//     expect(gatekeeper.transform_gatekeeper(help_load_psp(field))).toMatchSnapshot()
//   )
// })

// describe('transform_kyverno', () => {
//   it('should do an empty PSP', () => expect(kyverno.transform_kyverno(fixturePSPObject)).toStrictEqual([]))
//   test.each(pspFields)('%s', (field) =>
//     expect(kyverno.transform_kyverno(help_load_psp(field))).toMatchSnapshot()
//   )
// })

// describe('transform_kubewarden', () => {
//   it('should do an empty PSP', () => expect(kubewarden.transform_kubewarden(fixturePSPObject)).toStrictEqual([]))
//   test.each(pspFields)('%s', (field) =>
//     expect(kubewarden.transform_kubewarden(help_load_psp(field))).toMatchSnapshot()
//   )
// })
const fixtures = {
  locals: [
    {
      create: "${var.create && var.putin_khuylo}",
      this_sg_id:
        '${var.create_sg ? concat(aws_security_group.this.*.id, aws_security_group.this_name_prefix.*.id, [""])[0] : var.security_group_id}',
    },
  ],
  output: {
    security_group_description: [
      {
        description: "The description of the security group",
        value:
          '${try(aws_security_group.this[0].description, aws_security_group.this_name_prefix[0].description, "")}',
      },
    ],
    security_group_id: [
      {
        description: "The ID of the security group",
        value:
          '${try(aws_security_group.this[0].id, aws_security_group.this_name_prefix[0].id, "")}',
      },
    ],
    security_group_name: [
      {
        description: "The name of the security group",
        value:
          '${try(aws_security_group.this[0].name, aws_security_group.this_name_prefix[0].name, "")}',
      },
    ],
    security_group_owner_id: [
      {
        description: "The owner ID",
        value:
          '${try(aws_security_group.this[0].owner_id, aws_security_group.this_name_prefix[0].owner_id, "")}',
      },
    ],
    security_group_vpc_id: [
      {
        description: "The VPC ID",
        value:
          '${try(aws_security_group.this[0].vpc_id, aws_security_group.this_name_prefix[0].vpc_id, "")}',
      },
    ],
  },
  resource: {
    aws_security_group: {
      this: [
        {
          count:
            "${local.create && var.create_sg && !var.use_name_prefix ? 1 : 0}",
          description: "${var.description}",
          name: "${var.name}",
          revoke_rules_on_delete: "${var.revoke_rules_on_delete}",
          tags: '${merge(\n    {\n      "Name" = format("%s", var.name)\n    },\n    var.tags,\n  )}',
          timeouts: [
            {
              create: "${var.create_timeout}",
              delete: "${var.delete_timeout}",
            },
          ],
          vpc_id: "${var.vpc_id}",
        },
      ],
      this_name_prefix: [
        {
          count:
            "${local.create && var.create_sg && var.use_name_prefix ? 1 : 0}",
          description: "${var.description}",
          lifecycle: [{ create_before_destroy: true }],
          name_prefix: "${var.name}-",
          revoke_rules_on_delete: "${var.revoke_rules_on_delete}",
          tags: '${merge(\n    {\n      "Name" = format("%s", var.name)\n    },\n    var.tags,\n  )}',
          timeouts: [
            {
              create: "${var.create_timeout}",
              delete: "${var.delete_timeout}",
            },
          ],
          vpc_id: "${var.vpc_id}",
        },
      ],
    },
    aws_security_group_rule: {
      computed_egress_rules: [
        {
          cidr_blocks: "${var.egress_cidr_blocks}",
          count: "${local.create ? var.number_of_computed_egress_rules : 0}",
          description:
            "${var.rules[var.computed_egress_rules[count.index]][3]}",
          from_port: "${var.rules[var.computed_egress_rules[count.index]][0]}",
          ipv6_cidr_blocks: "${var.egress_ipv6_cidr_blocks}",
          prefix_list_ids: "${var.egress_prefix_list_ids}",
          protocol: "${var.rules[var.computed_egress_rules[count.index]][2]}",
          security_group_id: "${local.this_sg_id}",
          to_port: "${var.rules[var.computed_egress_rules[count.index]][1]}",
          type: "egress",
        },
      ],
      computed_egress_with_cidr_blocks: [
        {
          cidr_blocks:
            '${split(\n    ",",\n    lookup(\n      var.computed_egress_with_cidr_blocks[count.index],\n      "cidr_blocks",\n      join(",", var.egress_cidr_blocks),\n    ),\n  )}',
          count:
            "${local.create ? var.number_of_computed_egress_with_cidr_blocks : 0}",
          description:
            '${lookup(\n    var.computed_egress_with_cidr_blocks[count.index],\n    "description",\n    "Egress Rule",\n  )}',
          from_port:
            '${lookup(\n    var.computed_egress_with_cidr_blocks[count.index],\n    "from_port",\n    var.rules[lookup(\n      var.computed_egress_with_cidr_blocks[count.index],\n      "rule",\n      "_",\n    )][0],\n  )}',
          prefix_list_ids: "${var.egress_prefix_list_ids}",
          protocol:
            '${lookup(\n    var.computed_egress_with_cidr_blocks[count.index],\n    "protocol",\n    var.rules[lookup(\n      var.computed_egress_with_cidr_blocks[count.index],\n      "rule",\n      "_",\n    )][2],\n  )}',
          security_group_id: "${local.this_sg_id}",
          to_port:
            '${lookup(\n    var.computed_egress_with_cidr_blocks[count.index],\n    "to_port",\n    var.rules[lookup(\n      var.computed_egress_with_cidr_blocks[count.index],\n      "rule",\n      "_",\n    )][1],\n  )}',
          type: "egress",
        },
      ],
      computed_egress_with_ipv6_cidr_blocks: [
        {
          count:
            "${local.create ? var.number_of_computed_egress_with_ipv6_cidr_blocks : 0}",
          description:
            '${lookup(\n    var.computed_egress_with_ipv6_cidr_blocks[count.index],\n    "description",\n    "Egress Rule",\n  )}',
          from_port:
            '${lookup(\n    var.computed_egress_with_ipv6_cidr_blocks[count.index],\n    "from_port",\n    var.rules[lookup(\n      var.computed_egress_with_ipv6_cidr_blocks[count.index],\n      "rule",\n      "_",\n    )][0],\n  )}',
          ipv6_cidr_blocks:
            '${split(\n    ",",\n    lookup(\n      var.computed_egress_with_ipv6_cidr_blocks[count.index],\n      "ipv6_cidr_blocks",\n      join(",", var.egress_ipv6_cidr_blocks),\n    ),\n  )}',
          prefix_list_ids: "${var.egress_prefix_list_ids}",
          protocol:
            '${lookup(\n    var.computed_egress_with_ipv6_cidr_blocks[count.index],\n    "protocol",\n    var.rules[lookup(\n      var.computed_egress_with_ipv6_cidr_blocks[count.index],\n      "rule",\n      "_",\n    )][2],\n  )}',
          security_group_id: "${local.this_sg_id}",
          to_port:
            '${lookup(\n    var.computed_egress_with_ipv6_cidr_blocks[count.index],\n    "to_port",\n    var.rules[lookup(\n      var.computed_egress_with_ipv6_cidr_blocks[count.index],\n      "rule",\n      "_",\n    )][1],\n  )}',
          type: "egress",
        },
      ],
      computed_egress_with_self: [
        {
          count:
            "${local.create ? var.number_of_computed_egress_with_self : 0}",
          description:
            '${lookup(\n    var.computed_egress_with_self[count.index],\n    "description",\n    "Egress Rule",\n  )}',
          from_port:
            '${lookup(\n    var.computed_egress_with_self[count.index],\n    "from_port",\n    var.rules[lookup(var.computed_egress_with_self[count.index], "rule", "_")][0],\n  )}',
          prefix_list_ids: "${var.egress_prefix_list_ids}",
          protocol:
            '${lookup(\n    var.computed_egress_with_self[count.index],\n    "protocol",\n    var.rules[lookup(var.computed_egress_with_self[count.index], "rule", "_")][2],\n  )}',
          security_group_id: "${local.this_sg_id}",
          self: '${lookup(var.computed_egress_with_self[count.index], "self", true)}',
          to_port:
            '${lookup(\n    var.computed_egress_with_self[count.index],\n    "to_port",\n    var.rules[lookup(var.computed_egress_with_self[count.index], "rule", "_")][1],\n  )}',
          type: "egress",
        },
      ],
      computed_egress_with_source_security_group_id: [
        {
          count:
            "${local.create ? var.number_of_computed_egress_with_source_security_group_id : 0}",
          description:
            '${lookup(\n    var.computed_egress_with_source_security_group_id[count.index],\n    "description",\n    "Egress Rule",\n  )}',
          from_port:
            '${lookup(\n    var.computed_egress_with_source_security_group_id[count.index],\n    "from_port",\n    var.rules[lookup(\n      var.computed_egress_with_source_security_group_id[count.index],\n      "rule",\n      "_",\n    )][0],\n  )}',
          prefix_list_ids: "${var.egress_prefix_list_ids}",
          protocol:
            '${lookup(\n    var.computed_egress_with_source_security_group_id[count.index],\n    "protocol",\n    var.rules[lookup(\n      var.computed_egress_with_source_security_group_id[count.index],\n      "rule",\n      "_",\n    )][2],\n  )}',
          security_group_id: "${local.this_sg_id}",
          source_security_group_id:
            '${var.computed_egress_with_source_security_group_id[count.index]["source_security_group_id"]}',
          to_port:
            '${lookup(\n    var.computed_egress_with_source_security_group_id[count.index],\n    "to_port",\n    var.rules[lookup(\n      var.computed_egress_with_source_security_group_id[count.index],\n      "rule",\n      "_",\n    )][1],\n  )}',
          type: "egress",
        },
      ],
      computed_ingress_rules: [
        {
          cidr_blocks: "${var.ingress_cidr_blocks}",
          count: "${local.create ? var.number_of_computed_ingress_rules : 0}",
          description:
            "${var.rules[var.computed_ingress_rules[count.index]][3]}",
          from_port: "${var.rules[var.computed_ingress_rules[count.index]][0]}",
          ipv6_cidr_blocks: "${var.ingress_ipv6_cidr_blocks}",
          prefix_list_ids: "${var.ingress_prefix_list_ids}",
          protocol: "${var.rules[var.computed_ingress_rules[count.index]][2]}",
          security_group_id: "${local.this_sg_id}",
          to_port: "${var.rules[var.computed_ingress_rules[count.index]][1]}",
          type: "ingress",
        },
      ],
      computed_ingress_with_cidr_blocks: [
        {
          cidr_blocks:
            '${split(\n    ",",\n    lookup(\n      var.computed_ingress_with_cidr_blocks[count.index],\n      "cidr_blocks",\n      join(",", var.ingress_cidr_blocks),\n    ),\n  )}',
          count:
            "${local.create ? var.number_of_computed_ingress_with_cidr_blocks : 0}",
          description:
            '${lookup(\n    var.computed_ingress_with_cidr_blocks[count.index],\n    "description",\n    "Ingress Rule",\n  )}',
          from_port:
            '${lookup(\n    var.computed_ingress_with_cidr_blocks[count.index],\n    "from_port",\n    var.rules[lookup(\n      var.computed_ingress_with_cidr_blocks[count.index],\n      "rule",\n      "_",\n    )][0],\n  )}',
          prefix_list_ids: "${var.ingress_prefix_list_ids}",
          protocol:
            '${lookup(\n    var.computed_ingress_with_cidr_blocks[count.index],\n    "protocol",\n    var.rules[lookup(\n      var.computed_ingress_with_cidr_blocks[count.index],\n      "rule",\n      "_",\n    )][2],\n  )}',
          security_group_id: "${local.this_sg_id}",
          to_port:
            '${lookup(\n    var.computed_ingress_with_cidr_blocks[count.index],\n    "to_port",\n    var.rules[lookup(\n      var.computed_ingress_with_cidr_blocks[count.index],\n      "rule",\n      "_",\n    )][1],\n  )}',
          type: "ingress",
        },
      ],
      computed_ingress_with_ipv6_cidr_blocks: [
        {
          count:
            "${local.create ? var.number_of_computed_ingress_with_ipv6_cidr_blocks : 0}",
          description:
            '${lookup(\n    var.computed_ingress_with_ipv6_cidr_blocks[count.index],\n    "description",\n    "Ingress Rule",\n  )}',
          from_port:
            '${lookup(\n    var.computed_ingress_with_ipv6_cidr_blocks[count.index],\n    "from_port",\n    var.rules[lookup(\n      var.computed_ingress_with_ipv6_cidr_blocks[count.index],\n      "rule",\n      "_",\n    )][0],\n  )}',
          ipv6_cidr_blocks:
            '${split(\n    ",",\n    lookup(\n      var.computed_ingress_with_ipv6_cidr_blocks[count.index],\n      "ipv6_cidr_blocks",\n      join(",", var.ingress_ipv6_cidr_blocks),\n    ),\n  )}',
          prefix_list_ids: "${var.ingress_prefix_list_ids}",
          protocol:
            '${lookup(\n    var.computed_ingress_with_ipv6_cidr_blocks[count.index],\n    "protocol",\n    var.rules[lookup(\n      var.computed_ingress_with_ipv6_cidr_blocks[count.index],\n      "rule",\n      "_",\n    )][2],\n  )}',
          security_group_id: "${local.this_sg_id}",
          to_port:
            '${lookup(\n    var.computed_ingress_with_ipv6_cidr_blocks[count.index],\n    "to_port",\n    var.rules[lookup(\n      var.computed_ingress_with_ipv6_cidr_blocks[count.index],\n      "rule",\n      "_",\n    )][1],\n  )}',
          type: "ingress",
        },
      ],
      computed_ingress_with_self: [
        {
          count:
            "${local.create ? var.number_of_computed_ingress_with_self : 0}",
          description:
            '${lookup(\n    var.computed_ingress_with_self[count.index],\n    "description",\n    "Ingress Rule",\n  )}',
          from_port:
            '${lookup(\n    var.computed_ingress_with_self[count.index],\n    "from_port",\n    var.rules[lookup(var.computed_ingress_with_self[count.index], "rule", "_")][0],\n  )}',
          prefix_list_ids: "${var.ingress_prefix_list_ids}",
          protocol:
            '${lookup(\n    var.computed_ingress_with_self[count.index],\n    "protocol",\n    var.rules[lookup(var.computed_ingress_with_self[count.index], "rule", "_")][2],\n  )}',
          security_group_id: "${local.this_sg_id}",
          self: '${lookup(var.computed_ingress_with_self[count.index], "self", true)}',
          to_port:
            '${lookup(\n    var.computed_ingress_with_self[count.index],\n    "to_port",\n    var.rules[lookup(var.computed_ingress_with_self[count.index], "rule", "_")][1],\n  )}',
          type: "ingress",
        },
      ],
      computed_ingress_with_source_security_group_id: [
        {
          count:
            "${local.create ? var.number_of_computed_ingress_with_source_security_group_id : 0}",
          description:
            '${lookup(\n    var.computed_ingress_with_source_security_group_id[count.index],\n    "description",\n    "Ingress Rule",\n  )}',
          from_port:
            '${lookup(\n    var.computed_ingress_with_source_security_group_id[count.index],\n    "from_port",\n    var.rules[lookup(\n      var.computed_ingress_with_source_security_group_id[count.index],\n      "rule",\n      "_",\n    )][0],\n  )}',
          prefix_list_ids: "${var.ingress_prefix_list_ids}",
          protocol:
            '${lookup(\n    var.computed_ingress_with_source_security_group_id[count.index],\n    "protocol",\n    var.rules[lookup(\n      var.computed_ingress_with_source_security_group_id[count.index],\n      "rule",\n      "_",\n    )][2],\n  )}',
          security_group_id: "${local.this_sg_id}",
          source_security_group_id:
            '${var.computed_ingress_with_source_security_group_id[count.index]["source_security_group_id"]}',
          to_port:
            '${lookup(\n    var.computed_ingress_with_source_security_group_id[count.index],\n    "to_port",\n    var.rules[lookup(\n      var.computed_ingress_with_source_security_group_id[count.index],\n      "rule",\n      "_",\n    )][1],\n  )}',
          type: "ingress",
        },
      ],
      egress_rules: [
        {
          cidr_blocks: "${var.egress_cidr_blocks}",
          count: "${local.create ? length(var.egress_rules) : 0}",
          description: "${var.rules[var.egress_rules[count.index]][3]}",
          from_port: "${var.rules[var.egress_rules[count.index]][0]}",
          ipv6_cidr_blocks: "${var.egress_ipv6_cidr_blocks}",
          prefix_list_ids: "${var.egress_prefix_list_ids}",
          protocol: "${var.rules[var.egress_rules[count.index]][2]}",
          security_group_id: "${local.this_sg_id}",
          to_port: "${var.rules[var.egress_rules[count.index]][1]}",
          type: "egress",
        },
      ],
      egress_with_cidr_blocks: [
        {
          cidr_blocks:
            '${split(\n    ",",\n    lookup(\n      var.egress_with_cidr_blocks[count.index],\n      "cidr_blocks",\n      join(",", var.egress_cidr_blocks),\n    ),\n  )}',
          count: "${local.create ? length(var.egress_with_cidr_blocks) : 0}",
          description:
            '${lookup(\n    var.egress_with_cidr_blocks[count.index],\n    "description",\n    "Egress Rule",\n  )}',
          from_port:
            '${lookup(\n    var.egress_with_cidr_blocks[count.index],\n    "from_port",\n    var.rules[lookup(var.egress_with_cidr_blocks[count.index], "rule", "_")][0],\n  )}',
          prefix_list_ids: "${var.egress_prefix_list_ids}",
          protocol:
            '${lookup(\n    var.egress_with_cidr_blocks[count.index],\n    "protocol",\n    var.rules[lookup(var.egress_with_cidr_blocks[count.index], "rule", "_")][2],\n  )}',
          security_group_id: "${local.this_sg_id}",
          to_port:
            '${lookup(\n    var.egress_with_cidr_blocks[count.index],\n    "to_port",\n    var.rules[lookup(var.egress_with_cidr_blocks[count.index], "rule", "_")][1],\n  )}',
          type: "egress",
        },
      ],
      egress_with_ipv6_cidr_blocks: [
        {
          count:
            "${local.create ? length(var.egress_with_ipv6_cidr_blocks) : 0}",
          description:
            '${lookup(\n    var.egress_with_ipv6_cidr_blocks[count.index],\n    "description",\n    "Egress Rule",\n  )}',
          from_port:
            '${lookup(\n    var.egress_with_ipv6_cidr_blocks[count.index],\n    "from_port",\n    var.rules[lookup(var.egress_with_ipv6_cidr_blocks[count.index], "rule", "_")][0],\n  )}',
          ipv6_cidr_blocks:
            '${split(\n    ",",\n    lookup(\n      var.egress_with_ipv6_cidr_blocks[count.index],\n      "ipv6_cidr_blocks",\n      join(",", var.egress_ipv6_cidr_blocks),\n    ),\n  )}',
          prefix_list_ids: "${var.egress_prefix_list_ids}",
          protocol:
            '${lookup(\n    var.egress_with_ipv6_cidr_blocks[count.index],\n    "protocol",\n    var.rules[lookup(var.egress_with_ipv6_cidr_blocks[count.index], "rule", "_")][2],\n  )}',
          security_group_id: "${local.this_sg_id}",
          to_port:
            '${lookup(\n    var.egress_with_ipv6_cidr_blocks[count.index],\n    "to_port",\n    var.rules[lookup(var.egress_with_ipv6_cidr_blocks[count.index], "rule", "_")][1],\n  )}',
          type: "egress",
        },
      ],
      egress_with_self: [
        {
          count: "${local.create ? length(var.egress_with_self) : 0}",
          description:
            '${lookup(\n    var.egress_with_self[count.index],\n    "description",\n    "Egress Rule",\n  )}',
          from_port:
            '${lookup(\n    var.egress_with_self[count.index],\n    "from_port",\n    var.rules[lookup(var.egress_with_self[count.index], "rule", "_")][0],\n  )}',
          prefix_list_ids: "${var.egress_prefix_list_ids}",
          protocol:
            '${lookup(\n    var.egress_with_self[count.index],\n    "protocol",\n    var.rules[lookup(var.egress_with_self[count.index], "rule", "_")][2],\n  )}',
          security_group_id: "${local.this_sg_id}",
          self: '${lookup(var.egress_with_self[count.index], "self", true)}',
          to_port:
            '${lookup(\n    var.egress_with_self[count.index],\n    "to_port",\n    var.rules[lookup(var.egress_with_self[count.index], "rule", "_")][1],\n  )}',
          type: "egress",
        },
      ],
      egress_with_source_security_group_id: [
        {
          count:
            "${local.create ? length(var.egress_with_source_security_group_id) : 0}",
          description:
            '${lookup(\n    var.egress_with_source_security_group_id[count.index],\n    "description",\n    "Egress Rule",\n  )}',
          from_port:
            '${lookup(\n    var.egress_with_source_security_group_id[count.index],\n    "from_port",\n    var.rules[lookup(\n      var.egress_with_source_security_group_id[count.index],\n      "rule",\n      "_",\n    )][0],\n  )}',
          prefix_list_ids: "${var.egress_prefix_list_ids}",
          protocol:
            '${lookup(\n    var.egress_with_source_security_group_id[count.index],\n    "protocol",\n    var.rules[lookup(\n      var.egress_with_source_security_group_id[count.index],\n      "rule",\n      "_",\n    )][2],\n  )}',
          security_group_id: "${local.this_sg_id}",
          source_security_group_id:
            '${var.egress_with_source_security_group_id[count.index]["source_security_group_id"]}',
          to_port:
            '${lookup(\n    var.egress_with_source_security_group_id[count.index],\n    "to_port",\n    var.rules[lookup(\n      var.egress_with_source_security_group_id[count.index],\n      "rule",\n      "_",\n    )][1],\n  )}',
          type: "egress",
        },
      ],
      ingress_rules: [
        {
          cidr_blocks: "${var.ingress_cidr_blocks}",
          count: "${local.create ? length(var.ingress_rules) : 0}",
          description: "${var.rules[var.ingress_rules[count.index]][3]}",
          from_port: "${var.rules[var.ingress_rules[count.index]][0]}",
          ipv6_cidr_blocks: "${var.ingress_ipv6_cidr_blocks}",
          prefix_list_ids: "${var.ingress_prefix_list_ids}",
          protocol: "${var.rules[var.ingress_rules[count.index]][2]}",
          security_group_id: "${local.this_sg_id}",
          to_port: "${var.rules[var.ingress_rules[count.index]][1]}",
          type: "ingress",
        },
      ],
      ingress_with_cidr_blocks: [
        {
          cidr_blocks:
            '${split(\n    ",",\n    lookup(\n      var.ingress_with_cidr_blocks[count.index],\n      "cidr_blocks",\n      join(",", var.ingress_cidr_blocks),\n    ),\n  )}',
          count: "${local.create ? length(var.ingress_with_cidr_blocks) : 0}",
          description:
            '${lookup(\n    var.ingress_with_cidr_blocks[count.index],\n    "description",\n    "Ingress Rule",\n  )}',
          from_port:
            '${lookup(\n    var.ingress_with_cidr_blocks[count.index],\n    "from_port",\n    var.rules[lookup(var.ingress_with_cidr_blocks[count.index], "rule", "_")][0],\n  )}',
          prefix_list_ids: "${var.ingress_prefix_list_ids}",
          protocol:
            '${lookup(\n    var.ingress_with_cidr_blocks[count.index],\n    "protocol",\n    var.rules[lookup(var.ingress_with_cidr_blocks[count.index], "rule", "_")][2],\n  )}',
          security_group_id: "${local.this_sg_id}",
          to_port:
            '${lookup(\n    var.ingress_with_cidr_blocks[count.index],\n    "to_port",\n    var.rules[lookup(var.ingress_with_cidr_blocks[count.index], "rule", "_")][1],\n  )}',
          type: "ingress",
        },
      ],
      ingress_with_ipv6_cidr_blocks: [
        {
          count:
            "${local.create ? length(var.ingress_with_ipv6_cidr_blocks) : 0}",
          description:
            '${lookup(\n    var.ingress_with_ipv6_cidr_blocks[count.index],\n    "description",\n    "Ingress Rule",\n  )}',
          from_port:
            '${lookup(\n    var.ingress_with_ipv6_cidr_blocks[count.index],\n    "from_port",\n    var.rules[lookup(var.ingress_with_ipv6_cidr_blocks[count.index], "rule", "_")][0],\n  )}',
          ipv6_cidr_blocks:
            '${split(\n    ",",\n    lookup(\n      var.ingress_with_ipv6_cidr_blocks[count.index],\n      "ipv6_cidr_blocks",\n      join(",", var.ingress_ipv6_cidr_blocks),\n    ),\n  )}',
          prefix_list_ids: "${var.ingress_prefix_list_ids}",
          protocol:
            '${lookup(\n    var.ingress_with_ipv6_cidr_blocks[count.index],\n    "protocol",\n    var.rules[lookup(var.ingress_with_ipv6_cidr_blocks[count.index], "rule", "_")][2],\n  )}',
          security_group_id: "${local.this_sg_id}",
          to_port:
            '${lookup(\n    var.ingress_with_ipv6_cidr_blocks[count.index],\n    "to_port",\n    var.rules[lookup(var.ingress_with_ipv6_cidr_blocks[count.index], "rule", "_")][1],\n  )}',
          type: "ingress",
        },
      ],
      ingress_with_self: [
        {
          count: "${local.create ? length(var.ingress_with_self) : 0}",
          description:
            '${lookup(\n    var.ingress_with_self[count.index],\n    "description",\n    "Ingress Rule",\n  )}',
          from_port:
            '${lookup(\n    var.ingress_with_self[count.index],\n    "from_port",\n    var.rules[lookup(var.ingress_with_self[count.index], "rule", "_")][0],\n  )}',
          prefix_list_ids: "${var.ingress_prefix_list_ids}",
          protocol:
            '${lookup(\n    var.ingress_with_self[count.index],\n    "protocol",\n    var.rules[lookup(var.ingress_with_self[count.index], "rule", "_")][2],\n  )}',
          security_group_id: "${local.this_sg_id}",
          self: '${lookup(var.ingress_with_self[count.index], "self", true)}',
          to_port:
            '${lookup(\n    var.ingress_with_self[count.index],\n    "to_port",\n    var.rules[lookup(var.ingress_with_self[count.index], "rule", "_")][1],\n  )}',
          type: "ingress",
        },
      ],
      ingress_with_source_security_group_id: [
        {
          count:
            "${local.create ? length(var.ingress_with_source_security_group_id) : 0}",
          description:
            '${lookup(\n    var.ingress_with_source_security_group_id[count.index],\n    "description",\n    "Ingress Rule",\n  )}',
          from_port:
            '${lookup(\n    var.ingress_with_source_security_group_id[count.index],\n    "from_port",\n    var.rules[lookup(\n      var.ingress_with_source_security_group_id[count.index],\n      "rule",\n      "_",\n    )][0],\n  )}',
          prefix_list_ids: "${var.ingress_prefix_list_ids}",
          protocol:
            '${lookup(\n    var.ingress_with_source_security_group_id[count.index],\n    "protocol",\n    var.rules[lookup(\n      var.ingress_with_source_security_group_id[count.index],\n      "rule",\n      "_",\n    )][2],\n  )}',
          security_group_id: "${local.this_sg_id}",
          source_security_group_id:
            '${var.ingress_with_source_security_group_id[count.index]["source_security_group_id"]}',
          to_port:
            '${lookup(\n    var.ingress_with_source_security_group_id[count.index],\n    "to_port",\n    var.rules[lookup(\n      var.ingress_with_source_security_group_id[count.index],\n      "rule",\n      "_",\n    )][1],\n  )}',
          type: "ingress",
        },
      ],
    },
  },
  terraform: [
    {
      required_providers: [
        { aws: { source: "hashicorp/aws", version: ">= 3.0" } },
      ],
      required_version: ">= 0.13.1",
    },
  ],
  variable: {
    auto_groups: [
      {
        default: {
          activemq: {
            egress_rules: ["all-all"],
            ingress_rules: [
              "activemq-5671-tcp",
              "activemq-8883-tcp",
              "activemq-61614-tcp",
              "activemq-61617-tcp",
              "activemq-61619-tcp",
            ],
            ingress_with_self: ["all-all"],
          },
          alertmanager: {
            egress_rules: ["all-all"],
            ingress_rules: ["alertmanager-9093-tcp", "alertmanager-9094-tcp"],
            ingress_with_self: ["all-all"],
          },
          "carbon-relay-ng": {
            egress_rules: ["all-all"],
            ingress_rules: [
              "carbon-line-in-tcp",
              "carbon-line-in-udp",
              "carbon-pickle-tcp",
              "carbon-pickle-udp",
              "carbon-gui-udp",
            ],
            ingress_with_self: ["all-all"],
          },
          cassandra: {
            egress_rules: ["all-all"],
            ingress_rules: [
              "cassandra-clients-tcp",
              "cassandra-thrift-clients-tcp",
              "cassandra-jmx-tcp",
            ],
            ingress_with_self: ["all-all"],
          },
          consul: {
            egress_rules: ["all-all"],
            ingress_rules: [
              "consul-tcp",
              "consul-grpc-tcp",
              "consul-webui-http-tcp",
              "consul-webui-https-tcp",
              "consul-dns-tcp",
              "consul-dns-udp",
              "consul-serf-lan-tcp",
              "consul-serf-lan-udp",
              "consul-serf-wan-tcp",
              "consul-serf-wan-udp",
            ],
            ingress_with_self: ["all-all"],
          },
          "docker-swarm": {
            egress_rules: ["all-all"],
            ingress_rules: [
              "docker-swarm-mngmt-tcp",
              "docker-swarm-node-tcp",
              "docker-swarm-node-udp",
              "docker-swarm-overlay-udp",
            ],
            ingress_with_self: ["all-all"],
          },
          elasticsearch: {
            egress_rules: ["all-all"],
            ingress_rules: ["elasticsearch-rest-tcp", "elasticsearch-java-tcp"],
            ingress_with_self: ["all-all"],
          },
          etcd: {
            egress_rules: ["all-all"],
            ingress_rules: ["etcd-client-tcp", "etcd-peer-tcp"],
            ingress_with_self: ["all-all"],
          },
          grafana: {
            egress_rules: ["all-all"],
            ingress_rules: ["grafana-tcp"],
            ingress_with_self: ["all-all"],
          },
          "graphite-statsd": {
            egress_rules: ["all-all"],
            ingress_rules: [
              "graphite-webui",
              "graphite-2003-tcp",
              "graphite-2004-tcp",
              "graphite-2023-tcp",
              "graphite-2024-tcp",
              "graphite-8080-tcp",
              "graphite-8125-tcp",
              "graphite-8125-udp",
              "graphite-8126-tcp",
            ],
            ingress_with_self: ["all-all"],
          },
          "http-80": {
            egress_rules: ["all-all"],
            ingress_rules: ["http-80-tcp"],
            ingress_with_self: ["all-all"],
          },
          "http-8080": {
            egress_rules: ["all-all"],
            ingress_rules: ["http-8080-tcp"],
            ingress_with_self: ["all-all"],
          },
          "https-443": {
            egress_rules: ["all-all"],
            ingress_rules: ["https-443-tcp"],
            ingress_with_self: ["all-all"],
          },
          "https-8443": {
            egress_rules: ["all-all"],
            ingress_rules: ["https-8443-tcp"],
            ingress_with_self: ["all-all"],
          },
          "ipsec-4500": {
            egress_rules: ["all-all"],
            ingress_rules: ["ipsec-4500-udp"],
            ingress_with_self: ["all-all"],
          },
          "ipsec-500": {
            egress_rules: ["all-all"],
            ingress_rules: ["ipsec-500-udp"],
            ingress_with_self: ["all-all"],
          },
          kafka: {
            egress_rules: ["all-all"],
            ingress_rules: [
              "kafka-broker-tcp",
              "kafka-broker-tls-tcp",
              "kafka-jmx-exporter-tcp",
              "kafka-node-exporter-tcp",
            ],
            ingress_with_self: ["all-all"],
          },
          kibana: {
            egress_rules: ["all-all"],
            ingress_rules: ["kibana-tcp"],
            ingress_with_self: ["all-all"],
          },
          "kubernetes-api": {
            egress_rules: ["all-all"],
            ingress_rules: ["kubernetes-api-tcp"],
            ingress_with_self: ["all-all"],
          },
          ldap: {
            egress_rules: ["all-all"],
            ingress_rules: ["ldap-tcp"],
            ingress_with_self: ["all-all"],
          },
          ldaps: {
            egress_rules: ["all-all"],
            ingress_rules: ["ldaps-tcp"],
            ingress_with_self: ["all-all"],
          },
          logstash: {
            egress_rules: ["all-all"],
            ingress_rules: ["logstash-tcp"],
            ingress_with_self: ["all-all"],
          },
          memcached: {
            egress_rules: ["all-all"],
            ingress_rules: ["memcached-tcp"],
            ingress_with_self: ["all-all"],
          },
          minio: {
            egress_rules: ["all-all"],
            ingress_rules: ["minio-tcp"],
            ingress_with_self: ["all-all"],
          },
          mongodb: {
            egress_rules: ["all-all"],
            ingress_rules: [
              "mongodb-27017-tcp",
              "mongodb-27018-tcp",
              "mongodb-27019-tcp",
            ],
            ingress_with_self: ["all-all"],
          },
          mssql: {
            egress_rules: ["all-all"],
            ingress_rules: [
              "mssql-tcp",
              "mssql-udp",
              "mssql-analytics-tcp",
              "mssql-broker-tcp",
            ],
            ingress_with_self: ["all-all"],
          },
          mysql: {
            egress_rules: ["all-all"],
            ingress_rules: ["mysql-tcp"],
            ingress_with_self: ["all-all"],
          },
          nfs: {
            egress_rules: ["all-all"],
            ingress_rules: ["nfs-tcp"],
            ingress_with_self: ["all-all"],
          },
          nomad: {
            egress_rules: ["all-all"],
            ingress_rules: [
              "nomad-http-tcp",
              "nomad-rpc-tcp",
              "nomad-serf-tcp",
              "nomad-serf-udp",
            ],
            ingress_with_self: ["all-all"],
          },
          ntp: {
            egress_rules: ["all-all"],
            ingress_rules: ["ntp-udp"],
            ingress_with_self: ["all-all"],
          },
          openvpn: {
            egress_rules: ["all-all"],
            ingress_rules: ["openvpn-udp", "openvpn-tcp", "openvpn-https-tcp"],
            ingress_with_self: ["all-all"],
          },
          "oracle-db": {
            egress_rules: ["all-all"],
            ingress_rules: ["oracle-db-tcp"],
            ingress_with_self: ["all-all"],
          },
          postgresql: {
            egress_rules: ["all-all"],
            ingress_rules: ["postgresql-tcp"],
            ingress_with_self: ["all-all"],
          },
          prometheus: {
            egress_rules: ["all-all"],
            ingress_rules: [
              "prometheus-http-tcp",
              "prometheus-pushgateway-http-tcp",
            ],
            ingress_with_self: ["all-all"],
          },
          puppet: {
            egress_rules: ["all-all"],
            ingress_rules: ["puppet-tcp", "puppetdb-tcp"],
            ingress_with_self: ["all-all"],
          },
          rabbitmq: {
            egress_rules: ["all-all"],
            ingress_rules: [
              "rabbitmq-4369-tcp",
              "rabbitmq-5671-tcp",
              "rabbitmq-5672-tcp",
              "rabbitmq-15672-tcp",
              "rabbitmq-25672-tcp",
            ],
            ingress_with_self: ["all-all"],
          },
          rdp: {
            egress_rules: ["all-all"],
            ingress_rules: ["rdp-tcp", "rdp-udp"],
            ingress_with_self: ["all-all"],
          },
          redis: {
            egress_rules: ["all-all"],
            ingress_rules: ["redis-tcp"],
            ingress_with_self: ["all-all"],
          },
          redshift: {
            egress_rules: ["all-all"],
            ingress_rules: ["redshift-tcp"],
            ingress_with_self: ["all-all"],
          },
          smtp: {
            egress_rules: ["all-all"],
            ingress_rules: ["smtp-tcp"],
            ingress_with_self: ["all-all"],
          },
          "smtp-submission": {
            egress_rules: ["all-all"],
            ingress_rules: [
              "smtp-submission-587-tcp",
              "smtp-submission-2587-tcp",
            ],
            ingress_with_self: ["all-all"],
          },
          smtps: {
            egress_rules: ["all-all"],
            ingress_rules: ["smtps-465-tcp", "smtps-2465-tcp"],
            ingress_with_self: ["all-all"],
          },
          solr: {
            egress_rules: ["all-all"],
            ingress_rules: ["solr-tcp"],
            ingress_with_self: ["all-all"],
          },
          splunk: {
            egress_rules: ["all-all"],
            ingress_rules: [
              "splunk-indexer-tcp",
              "splunk-clients-tcp",
              "splunk-splunkd-tcp",
              "splunk-hec-tcp",
            ],
            ingress_with_self: ["all-all"],
          },
          squid: {
            egress_rules: ["all-all"],
            ingress_rules: ["squid-proxy-tcp"],
            ingress_with_self: ["all-all"],
          },
          ssh: {
            egress_rules: ["all-all"],
            ingress_rules: ["ssh-tcp"],
            ingress_with_self: ["all-all"],
          },
          storm: {
            egress_rules: ["all-all"],
            ingress_rules: [
              "storm-nimbus-tcp",
              "storm-ui-tcp",
              "storm-supervisor-tcp",
            ],
            ingress_with_self: ["all-all"],
          },
          web: {
            egress_rules: ["all-all"],
            ingress_rules: [
              "http-80-tcp",
              "http-8080-tcp",
              "https-443-tcp",
              "web-jmx-tcp",
            ],
            ingress_with_self: ["all-all"],
          },
          winrm: {
            egress_rules: ["all-all"],
            ingress_rules: ["winrm-http-tcp", "winrm-https-tcp"],
            ingress_with_self: ["all-all"],
          },
          zipkin: {
            egress_rules: ["all-all"],
            ingress_rules: [
              "zipkin-admin-tcp",
              "zipkin-admin-query-tcp",
              "zipkin-admin-web-tcp",
              "zipkin-query-tcp",
              "zipkin-web-tcp",
            ],
            ingress_with_self: ["all-all"],
          },
          zookeeper: {
            egress_rules: ["all-all"],
            ingress_rules: [
              "zookeeper-2181-tcp",
              "zookeeper-2888-tcp",
              "zookeeper-3888-tcp",
              "zookeeper-jmx-tcp",
            ],
            ingress_with_self: ["all-all"],
          },
        },
        description:
          "Map of groups of security group rules to use to generate modules (see update_groups.sh)",
        type: "${map(map(list(string)))}",
      },
    ],
    computed_egress_rules: [
      {
        default: [],
        description: "List of computed egress rules to create by name",
        type: "${list(string)}",
      },
    ],
    computed_egress_with_cidr_blocks: [
      {
        default: [],
        description:
          "List of computed egress rules to create where 'cidr_blocks' is used",
        type: "${list(map(string))}",
      },
    ],
    computed_egress_with_ipv6_cidr_blocks: [
      {
        default: [],
        description:
          "List of computed egress rules to create where 'ipv6_cidr_blocks' is used",
        type: "${list(map(string))}",
      },
    ],
    computed_egress_with_self: [
      {
        default: [],
        description:
          "List of computed egress rules to create where 'self' is defined",
        type: "${list(map(string))}",
      },
    ],
    computed_egress_with_source_security_group_id: [
      {
        default: [],
        description:
          "List of computed egress rules to create where 'source_security_group_id' is used",
        type: "${list(map(string))}",
      },
    ],
    computed_ingress_rules: [
      {
        default: [],
        description: "List of computed ingress rules to create by name",
        type: "${list(string)}",
      },
    ],
    computed_ingress_with_cidr_blocks: [
      {
        default: [],
        description:
          "List of computed ingress rules to create where 'cidr_blocks' is used",
        type: "${list(map(string))}",
      },
    ],
    computed_ingress_with_ipv6_cidr_blocks: [
      {
        default: [],
        description:
          "List of computed ingress rules to create where 'ipv6_cidr_blocks' is used",
        type: "${list(map(string))}",
      },
    ],
    computed_ingress_with_self: [
      {
        default: [],
        description:
          "List of computed ingress rules to create where 'self' is defined",
        type: "${list(map(string))}",
      },
    ],
    computed_ingress_with_source_security_group_id: [
      {
        default: [],
        description:
          "List of computed ingress rules to create where 'source_security_group_id' is used",
        type: "${list(map(string))}",
      },
    ],
    create: [
      {
        default: true,
        description: "Whether to create security group and all rules",
        type: "${bool}",
      },
    ],
    create_sg: [
      {
        default: true,
        description: "Whether to create security group",
        type: "${bool}",
      },
    ],
    create_timeout: [
      {
        default: "10m",
        description: "Time to wait for a security group to be created",
        type: "${string}",
      },
    ],
    delete_timeout: [
      {
        default: "15m",
        description: "Time to wait for a security group to be deleted",
        type: "${string}",
      },
    ],
    description: [
      {
        default: "Security Group managed by Terraform",
        description: "Description of security group",
        type: "${string}",
      },
    ],
    egress_cidr_blocks: [
      {
        default: ["0.0.0.0/0"],
        description: "List of IPv4 CIDR ranges to use on all egress rules",
        type: "${list(string)}",
      },
    ],
    egress_ipv6_cidr_blocks: [
      {
        default: ["::/0"],
        description: "List of IPv6 CIDR ranges to use on all egress rules",
        type: "${list(string)}",
      },
    ],
    egress_prefix_list_ids: [
      {
        default: [],
        description:
          "List of prefix list IDs (for allowing access to VPC endpoints) to use on all egress rules",
        type: "${list(string)}",
      },
    ],
    egress_rules: [
      {
        default: [],
        description: "List of egress rules to create by name",
        type: "${list(string)}",
      },
    ],
    egress_with_cidr_blocks: [
      {
        default: [],
        description:
          "List of egress rules to create where 'cidr_blocks' is used",
        type: "${list(map(string))}",
      },
    ],
    egress_with_ipv6_cidr_blocks: [
      {
        default: [],
        description:
          "List of egress rules to create where 'ipv6_cidr_blocks' is used",
        type: "${list(map(string))}",
      },
    ],
    egress_with_self: [
      {
        default: [],
        description: "List of egress rules to create where 'self' is defined",
        type: "${list(map(string))}",
      },
    ],
    egress_with_source_security_group_id: [
      {
        default: [],
        description:
          "List of egress rules to create where 'source_security_group_id' is used",
        type: "${list(map(string))}",
      },
    ],
    ingress_cidr_blocks: [
      {
        default: [],
        description: "List of IPv4 CIDR ranges to use on all ingress rules",
        type: "${list(string)}",
      },
    ],
    ingress_ipv6_cidr_blocks: [
      {
        default: [],
        description: "List of IPv6 CIDR ranges to use on all ingress rules",
        type: "${list(string)}",
      },
    ],
    ingress_prefix_list_ids: [
      {
        default: [],
        description:
          "List of prefix list IDs (for allowing access to VPC endpoints) to use on all ingress rules",
        type: "${list(string)}",
      },
    ],
    ingress_rules: [
      {
        default: [],
        description: "List of ingress rules to create by name",
        type: "${list(string)}",
      },
    ],
    ingress_with_cidr_blocks: [
      {
        default: [],
        description:
          "List of ingress rules to create where 'cidr_blocks' is used",
        type: "${list(map(string))}",
      },
    ],
    ingress_with_ipv6_cidr_blocks: [
      {
        default: [],
        description:
          "List of ingress rules to create where 'ipv6_cidr_blocks' is used",
        type: "${list(map(string))}",
      },
    ],
    ingress_with_self: [
      {
        default: [],
        description: "List of ingress rules to create where 'self' is defined",
        type: "${list(map(string))}",
      },
    ],
    ingress_with_source_security_group_id: [
      {
        default: [],
        description:
          "List of ingress rules to create where 'source_security_group_id' is used",
        type: "${list(map(string))}",
      },
    ],
    name: [
      {
        default: null,
        description:
          "Name of security group - not required if create_sg is false",
        type: "${string}",
      },
    ],
    number_of_computed_egress_rules: [
      {
        default: 0,
        description: "Number of computed egress rules to create by name",
        type: "${number}",
      },
    ],
    number_of_computed_egress_with_cidr_blocks: [
      {
        default: 0,
        description:
          "Number of computed egress rules to create where 'cidr_blocks' is used",
        type: "${number}",
      },
    ],
    number_of_computed_egress_with_ipv6_cidr_blocks: [
      {
        default: 0,
        description:
          "Number of computed egress rules to create where 'ipv6_cidr_blocks' is used",
        type: "${number}",
      },
    ],
    number_of_computed_egress_with_self: [
      {
        default: 0,
        description:
          "Number of computed egress rules to create where 'self' is defined",
        type: "${number}",
      },
    ],
    number_of_computed_egress_with_source_security_group_id: [
      {
        default: 0,
        description:
          "Number of computed egress rules to create where 'source_security_group_id' is used",
        type: "${number}",
      },
    ],
    number_of_computed_ingress_rules: [
      {
        default: 0,
        description: "Number of computed ingress rules to create by name",
        type: "${number}",
      },
    ],
    number_of_computed_ingress_with_cidr_blocks: [
      {
        default: 0,
        description:
          "Number of computed ingress rules to create where 'cidr_blocks' is used",
        type: "${number}",
      },
    ],
    number_of_computed_ingress_with_ipv6_cidr_blocks: [
      {
        default: 0,
        description:
          "Number of computed ingress rules to create where 'ipv6_cidr_blocks' is used",
        type: "${number}",
      },
    ],
    number_of_computed_ingress_with_self: [
      {
        default: 0,
        description:
          "Number of computed ingress rules to create where 'self' is defined",
        type: "${number}",
      },
    ],
    number_of_computed_ingress_with_source_security_group_id: [
      {
        default: 0,
        description:
          "Number of computed ingress rules to create where 'source_security_group_id' is used",
        type: "${number}",
      },
    ],
    putin_khuylo: [
      {
        default: true,
        description:
          "Do you agree that Putin doesn't respect Ukrainian sovereignty and territorial integrity? More info: https://en.wikipedia.org/wiki/Putin_khuylo!",
        type: "${bool}",
      },
    ],
    revoke_rules_on_delete: [
      {
        default: false,
        description:
          "Instruct Terraform to revoke all of the Security Groups attached ingress and egress rules before deleting the rule itself. Enable for EMR.",
        type: "${bool}",
      },
    ],
    rules: [
      {
        default: {
          _: ["", "", ""],
          "activemq-5671-tcp": [5671, 5671, "tcp", "ActiveMQ AMQP"],
          "activemq-61614-tcp": [61614, 61614, "tcp", "ActiveMQ STOMP"],
          "activemq-61617-tcp": [61617, 61617, "tcp", "ActiveMQ OpenWire"],
          "activemq-61619-tcp": [61619, 61619, "tcp", "ActiveMQ WebSocket"],
          "activemq-8883-tcp": [8883, 8883, "tcp", "ActiveMQ MQTT"],
          "alertmanager-9093-tcp": [9093, 9093, "tcp", "Alert Manager"],
          "alertmanager-9094-tcp": [9094, 9094, "tcp", "Alert Manager Cluster"],
          "all-all": [-1, -1, "-1", "All protocols"],
          "all-icmp": [-1, -1, "icmp", "All IPV4 ICMP"],
          "all-ipv6-icmp": [-1, -1, 58, "All IPV6 ICMP"],
          "all-tcp": [0, 65535, "tcp", "All TCP ports"],
          "all-udp": [0, 65535, "udp", "All UDP ports"],
          "carbon-admin-tcp": [2004, 2004, "tcp", "Carbon admin"],
          "carbon-gui-udp": [8081, 8081, "tcp", "Carbon GUI"],
          "carbon-line-in-tcp": [2003, 2003, "tcp", "Carbon line-in"],
          "carbon-line-in-udp": [2003, 2003, "udp", "Carbon line-in"],
          "carbon-pickle-tcp": [2013, 2013, "tcp", "Carbon pickle"],
          "carbon-pickle-udp": [2013, 2013, "udp", "Carbon pickle"],
          "cassandra-clients-tcp": [9042, 9042, "tcp", "Cassandra clients"],
          "cassandra-jmx-tcp": [7199, 7199, "tcp", "JMX"],
          "cassandra-thrift-clients-tcp": [
            9160,
            9160,
            "tcp",
            "Cassandra Thrift clients",
          ],
          "consul-dns-tcp": [8600, 8600, "tcp", "Consul DNS"],
          "consul-dns-udp": [8600, 8600, "udp", "Consul DNS"],
          "consul-grpc-tcp": [8502, 8502, "tcp", "Consul gRPC"],
          "consul-serf-lan-tcp": [8301, 8301, "tcp", "Serf LAN"],
          "consul-serf-lan-udp": [8301, 8301, "udp", "Serf LAN"],
          "consul-serf-wan-tcp": [8302, 8302, "tcp", "Serf WAN"],
          "consul-serf-wan-udp": [8302, 8302, "udp", "Serf WAN"],
          "consul-tcp": [8300, 8300, "tcp", "Consul server"],
          "consul-webui-http-tcp": [8500, 8500, "tcp", "Consul web UI HTTP"],
          "consul-webui-https-tcp": [8501, 8501, "tcp", "Consul web UI HTTPS"],
          "dns-tcp": [53, 53, "tcp", "DNS"],
          "dns-udp": [53, 53, "udp", "DNS"],
          "docker-swarm-mngmt-tcp": [
            2377,
            2377,
            "tcp",
            "Docker Swarm cluster management",
          ],
          "docker-swarm-node-tcp": [7946, 7946, "tcp", "Docker Swarm node"],
          "docker-swarm-node-udp": [7946, 7946, "udp", "Docker Swarm node"],
          "docker-swarm-overlay-udp": [
            4789,
            4789,
            "udp",
            "Docker Swarm Overlay Network Traffic",
          ],
          "elasticsearch-java-tcp": [
            9300,
            9300,
            "tcp",
            "Elasticsearch Java interface",
          ],
          "elasticsearch-rest-tcp": [
            9200,
            9200,
            "tcp",
            "Elasticsearch REST interface",
          ],
          "etcd-client-tcp": [2379, 2379, "tcp", "Etcd Client"],
          "etcd-peer-tcp": [2380, 2380, "tcp", "Etcd Peer"],
          "grafana-tcp": [3000, 3000, "tcp", "Grafana Dashboard"],
          "graphite-2003-tcp": [
            2003,
            2003,
            "tcp",
            "Carbon receiver plain text",
          ],
          "graphite-2004-tcp": [2004, 2004, "tcp", "Carbon receiver pickle"],
          "graphite-2023-tcp": [
            2023,
            2023,
            "tcp",
            "Carbon aggregator plaintext",
          ],
          "graphite-2024-tcp": [2024, 2024, "tcp", "Carbon aggregator pickle"],
          "graphite-8080-tcp": [8080, 8080, "tcp", "Graphite gunicorn port"],
          "graphite-8125-tcp": [8125, 8125, "tcp", "Statsd TCP"],
          "graphite-8125-udp": [8125, 8125, "udp", "Statsd UDP default"],
          "graphite-8126-tcp": [8126, 8126, "tcp", "Statsd admin"],
          "graphite-webui": [80, 80, "tcp", "Graphite admin interface"],
          "http-80-tcp": [80, 80, "tcp", "HTTP"],
          "http-8080-tcp": [8080, 8080, "tcp", "HTTP"],
          "https-443-tcp": [443, 443, "tcp", "HTTPS"],
          "https-8443-tcp": [8443, 8443, "tcp", "HTTPS"],
          "ipsec-4500-udp": [4500, 4500, "udp", "IPSEC NAT-T"],
          "ipsec-500-udp": [500, 500, "udp", "IPSEC ISAKMP"],
          "kafka-broker-tcp": [9092, 9092, "tcp", "Kafka broker 0.8.2+"],
          "kafka-broker-tls-tcp": [
            9094,
            9094,
            "tcp",
            "Kafka TLS enabled broker 0.8.2+",
          ],
          "kafka-jmx-exporter-tcp": [11001, 11001, "tcp", "Kafka JMX Exporter"],
          "kafka-node-exporter-tcp": [
            11002,
            11002,
            "tcp",
            "Kafka Node Exporter",
          ],
          "kibana-tcp": [5601, 5601, "tcp", "Kibana Web Interface"],
          "kubernetes-api-tcp": [6443, 6443, "tcp", "Kubernetes API Server"],
          "ldap-tcp": [389, 389, "tcp", "LDAP"],
          "ldaps-tcp": [636, 636, "tcp", "LDAPS"],
          "logstash-tcp": [5044, 5044, "tcp", "Logstash"],
          "memcached-tcp": [11211, 11211, "tcp", "Memcached"],
          "minio-tcp": [9000, 9000, "tcp", "MinIO"],
          "mongodb-27017-tcp": [27017, 27017, "tcp", "MongoDB"],
          "mongodb-27018-tcp": [27018, 27018, "tcp", "MongoDB shard"],
          "mongodb-27019-tcp": [27019, 27019, "tcp", "MongoDB config server"],
          "mssql-analytics-tcp": [2383, 2383, "tcp", "MSSQL Analytics"],
          "mssql-broker-tcp": [4022, 4022, "tcp", "MSSQL Broker"],
          "mssql-tcp": [1433, 1433, "tcp", "MSSQL Server"],
          "mssql-udp": [1434, 1434, "udp", "MSSQL Browser"],
          "mysql-tcp": [3306, 3306, "tcp", "MySQL/Aurora"],
          "nfs-tcp": [2049, 2049, "tcp", "NFS/EFS"],
          "nomad-http-tcp": [4646, 4646, "tcp", "Nomad HTTP"],
          "nomad-rpc-tcp": [4647, 4647, "tcp", "Nomad RPC"],
          "nomad-serf-tcp": [4648, 4648, "tcp", "Serf"],
          "nomad-serf-udp": [4648, 4648, "udp", "Serf"],
          "ntp-udp": [123, 123, "udp", "NTP"],
          "octopus-tentacle-tcp": [10933, 10933, "tcp", "Octopus Tentacle"],
          "openvpn-https-tcp": [443, 443, "tcp", "OpenVPN"],
          "openvpn-tcp": [943, 943, "tcp", "OpenVPN"],
          "openvpn-udp": [1194, 1194, "udp", "OpenVPN"],
          "oracle-db-tcp": [1521, 1521, "tcp", "Oracle"],
          "postgresql-tcp": [5432, 5432, "tcp", "PostgreSQL"],
          "prometheus-http-tcp": [9090, 9090, "tcp", "Prometheus"],
          "prometheus-pushgateway-http-tcp": [
            9091,
            9091,
            "tcp",
            "Prometheus Pushgateway",
          ],
          "puppet-tcp": [8140, 8140, "tcp", "Puppet"],
          "puppetdb-tcp": [8081, 8081, "tcp", "PuppetDB"],
          "rabbitmq-15672-tcp": [15672, 15672, "tcp", "RabbitMQ"],
          "rabbitmq-25672-tcp": [25672, 25672, "tcp", "RabbitMQ"],
          "rabbitmq-4369-tcp": [4369, 4369, "tcp", "RabbitMQ epmd"],
          "rabbitmq-5671-tcp": [5671, 5671, "tcp", "RabbitMQ"],
          "rabbitmq-5672-tcp": [5672, 5672, "tcp", "RabbitMQ"],
          "rdp-tcp": [3389, 3389, "tcp", "Remote Desktop"],
          "rdp-udp": [3389, 3389, "udp", "Remote Desktop"],
          "redis-tcp": [6379, 6379, "tcp", "Redis"],
          "redshift-tcp": [5439, 5439, "tcp", "Redshift"],
          "saltstack-tcp": [4505, 4506, "tcp", "SaltStack"],
          "smtp-submission-2587-tcp": [2587, 2587, "tcp", "SMTP Submission"],
          "smtp-submission-587-tcp": [587, 587, "tcp", "SMTP Submission"],
          "smtp-tcp": [25, 25, "tcp", "SMTP"],
          "smtps-2456-tcp": [2465, 2465, "tcp", "SMTPS"],
          "smtps-465-tcp": [465, 465, "tcp", "SMTPS"],
          "solr-tcp": [8983, 8987, "tcp", "Solr"],
          "splunk-hec-tcp": [8088, 8088, "tcp", "Splunk HEC"],
          "splunk-indexer-tcp": [9997, 9997, "tcp", "Splunk indexer"],
          "splunk-splunkd-tcp": [8089, 8089, "tcp", "Splunkd"],
          "splunk-web-tcp": [8000, 8000, "tcp", "Splunk Web"],
          "squid-proxy-tcp": [3128, 3128, "tcp", "Squid default proxy"],
          "ssh-tcp": [22, 22, "tcp", "SSH"],
          "storm-nimbus-tcp": [6627, 6627, "tcp", "Nimbus"],
          "storm-supervisor-tcp": [6700, 6703, "tcp", "Supervisor"],
          "storm-ui-tcp": [8080, 8080, "tcp", "Storm UI"],
          "web-jmx-tcp": [1099, 1099, "tcp", "JMX"],
          "winrm-http-tcp": [5985, 5985, "tcp", "WinRM HTTP"],
          "winrm-https-tcp": [5986, 5986, "tcp", "WinRM HTTPS"],
          "zipkin-admin-query-tcp": [
            9901,
            9901,
            "tcp",
            "Zipkin Admin port query",
          ],
          "zipkin-admin-tcp": [
            9990,
            9990,
            "tcp",
            "Zipkin Admin port collector",
          ],
          "zipkin-admin-web-tcp": [9991, 9991, "tcp", "Zipkin Admin port web"],
          "zipkin-query-tcp": [9411, 9411, "tcp", "Zipkin query port"],
          "zipkin-web-tcp": [8080, 8080, "tcp", "Zipkin web port"],
          "zookeeper-2181-tcp": [2181, 2181, "tcp", "Zookeeper"],
          "zookeeper-2888-tcp": [2888, 2888, "tcp", "Zookeeper"],
          "zookeeper-3888-tcp": [3888, 3888, "tcp", "Zookeeper"],
          "zookeeper-jmx-tcp": [7199, 7199, "tcp", "JMX"],
        },
        description:
          "Map of known security group rules (define as 'name' = ['from port', 'to port', 'protocol', 'description'])",
        type: "${map(list(any))}",
      },
    ],
    security_group_id: [
      {
        default: null,
        description: "ID of existing security group whose rules we will manage",
        type: "${string}",
      },
    ],
    tags: [
      {
        default: {},
        description: "A mapping of tags to assign to security group",
        type: "${map(string)}",
      },
    ],
    use_name_prefix: [
      {
        default: true,
        description:
          "Whether to use name_prefix or fixed name. Should be true to able to update security group name after initial creation",
        type: "${bool}",
      },
    ],
    vpc_id: [
      {
        default: null,
        description: "ID of the VPC where to create security group",
        type: "${string}",
      },
    ],
  },
};
describe("parse hcl", () => {
  it("can parse tf", async () => {
    const parsed = await mod.parsetf("submodules/terraform-aws-security-group");
    expect(parsed).toEqual(fixtures);
  });
  it("can format variables", () => {
    const formatted = mod.formatVariables(fixtures);
    console.log(formatted);
    expect(formatted).toMatchSnapshot();
  });
});

describe("Can make a valid values.yaml", () => {
  it("can make a valid values.yaml", () => {
    const formatted = mod.formatVariables(fixtures);
    const yaml = mod.makeValuesYaml(formatted);
    expect(yaml).toMatchSnapshot();
  });
});

// describe.skip("Can make a resource.json", () => {
//   it("can make a valid resource json", () => {
//     const formatted = mod.formatVariables(fixtures);
//     const yaml = mod.makeResourceJson(formatted);
//     expect(yaml).toMatchSnapshot();
//   });
// });

describe("Can make a resource.yaml", () => {
  it("can make a valid resource yaml", () => {
    const formatted = mod.formatVariables(fixtures);
    const yaml = mod.makeResourceYaml(formatted);
    expect(yaml).toMatchSnapshot();
  });
});
