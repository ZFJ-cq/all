UPDATE cfg_realm_attribute_mult SET realm_name = '炼气期' WHERE realm_name = '炼气';
UPDATE cfg_realm_attribute_mult SET realm_name = '筑基期' WHERE realm_name = '筑基';
UPDATE cfg_realm_attribute_mult SET realm_name = '金丹期' WHERE realm_name = '金丹';
UPDATE cfg_realm_attribute_mult SET realm_name = '元婴期' WHERE realm_name = '元婴';
UPDATE cfg_realm_attribute_mult SET realm_name = '化神期' WHERE realm_name = '化神';
UPDATE cfg_realm_attribute_mult SET realm_name = '炼虚期' WHERE realm_name = '炼虚';
UPDATE cfg_realm_attribute_mult SET realm_name = '合体期' WHERE realm_name = '合体';
UPDATE cfg_realm_attribute_mult SET realm_name = '大乘期' WHERE realm_name = '大乘';
UPDATE cfg_realm_attribute_mult SET realm_name = '渡劫期' WHERE realm_name = '渡劫';

UPDATE game_role SET realm = '凡人' WHERE realm = '无修为' OR realm IS NULL;
