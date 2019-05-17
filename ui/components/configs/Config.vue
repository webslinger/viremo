<template>
    <div id="config">
      I'm a config. {{config}}
    </div>
</template>

<script>
import { ServiceFactory } from './../../api/serviceFactory';
const configService = ServiceFactory.get('configs');
export default {
    props: ['config'],
};
</script>

<style>
#configs {
  font-size: 18px;
  font-family: 'Roboto', sans-serif;
  color: blue;
}
</style>

