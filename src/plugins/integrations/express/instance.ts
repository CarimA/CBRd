import Express from 'express';

const instance = Express();
instance.listen(process.env['PORT'] || 3000);

export const express = instance;
